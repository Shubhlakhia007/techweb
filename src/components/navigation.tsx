'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

export function Navigation({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const links = [['/events', 'Competitions'], ['/teams', 'Find a team'], ['/#how-it-works', 'How it works']];
  return <nav className="navbar" aria-label="Main navigation" onKeyDown={e => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }}>
    <Link href="/" className="nav-logo" onClick={() => setOpen(false)} aria-label="techweb home"><span className="brand-symbol" aria-hidden="true">W</span>tech<span>web</span></Link>
    <button className="menu-toggle btn btn-secondary" ref={toggle} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <ul id="main-navigation" className={'nav-links' + (open ? ' is-open' : '')}>
      {links.map(([href, label]) => <li key={href}><Link href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link></li>)}
    </ul>
    <Link className="btn btn-primary nav-account" href={signedIn ? '/profile' : '/auth?mode=register'} onClick={() => setOpen(false)}>{signedIn ? 'My profile' : 'Get started'} <span aria-hidden="true">↗</span></Link>
  </nav>;
}
