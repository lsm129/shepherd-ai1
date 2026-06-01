'use client';
import { useEffect } from 'react';

/**
 * Chrome's built-in translation inserts <font> elements to wrap translated text.
 * React doesn't expect these foreign DOM nodes and crashes during reconciliation.
 * This MutationObserver detects and unwraps <font> tags before React sees them,
 * keeping the translated text but removing the structural elements that break React.
 */
export default function TranslationSanitizer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function unwrapFontElements() {
      const fonts = document.querySelectorAll('font');
      fonts.forEach(font => {
        const parent = font.parentNode;
        if (parent) {
          while (font.firstChild) {
            parent.insertBefore(font.firstChild, font);
          }
          parent.removeChild(font);
        }
      });
    }

    // Initial sweep: remove any <font> tags already in the DOM
    unwrapFontElements();

    const observer = new MutationObserver((mutations) => {
      let hasFont = false;
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement && node.tagName === 'FONT') {
            hasFont = true;
            break;
          }
          // Also check children of added nodes
          if (node instanceof HTMLElement && node.querySelectorAll('font').length > 0) {
            hasFont = true;
            break;
          }
        }
        if (hasFont) break;
      }

      if (hasFont) {
        // Use requestAnimationFrame to avoid interfering with React's reconciliation
        requestAnimationFrame(() => {
          unwrapFontElements();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
