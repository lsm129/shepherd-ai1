'use client';
import { useEffect, useRef } from 'react';

/**
 * Chrome's built-in translation inserts <font> elements that break React.
 * This MutationObserver detects and unwraps <font> tags with debouncing
 * to prevent performance issues and infinite loops.
 */
export default function TranslationSanitizer({ children }: { children: React.ReactNode }) {
  const processingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function unwrapFontElements() {
      if (processingRef.current) return;
      processingRef.current = true;
      
      try {
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
      } catch (e) {
        // Silently ignore - never let this break the app
      }
      
      // Debounce: wait 100ms before allowing next processing
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
    }

    // Initial sweep
    unwrapFontElements();

    const observer = new MutationObserver((mutations) => {
      // Skip if already processing
      if (processingRef.current) return;
      
      let hasFont = false;
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement && node.tagName === 'FONT') {
            hasFont = true;
            break;
          }
          if (node instanceof HTMLElement && node.querySelectorAll('font').length > 0) {
            hasFont = true;
            break;
          }
        }
        if (hasFont) break;
      }

      if (hasFont) {
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
