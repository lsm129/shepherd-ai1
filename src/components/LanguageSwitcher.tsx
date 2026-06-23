'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  
  const isPT = pathname.startsWith('/pt');
  
  const targetLang = isPT ? 'EN' : 'PT';
  const targetFlag = isPT ? '🇺🇸' : '🇧🇷';
  
  let targetHref: string;
  
  if (isPT) {
    // PT → EN: strip /pt prefix
    targetHref = pathname.replace(/^\/pt/, '') || '/';
    // Default to / if empty (PT homepage → EN homepage)
    if (targetHref === '') targetHref = '/';
  } else {
    // EN → PT: add /pt prefix
    // For homepage: go to /pt/blog
    // For blog pages: add /pt prefix
    // For other pages: just add /pt prefix (or default to /pt/blog)
    if (pathname === '/' || pathname === '') {
      targetHref = '/pt';
    } else if (pathname.startsWith('/blog')) {
      targetHref = `/pt${pathname}`;
    } else {
      // Other pages don't have PT version, go to PT blog
      targetHref = '/pt/blog';
    }
  }

  return (
    <Link
      href={targetHref}
      style={{
        fontSize: '13px',
        fontWeight: 700,
        background: isPT ? '#1e3a5f' : '#10b981',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '6px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {targetFlag} {targetLang}
    </Link>
  );
}
