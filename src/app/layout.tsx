import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { currentUser } from '@/lib/auth';
export const metadata: Metadata = {
  title: 'techweb — Find your people. Build what’s next.',
  description: 'Discover hackathons and CTFs, share your skills, and build a team with complementary strengths on techweb.',
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><nav className="navbar" aria-label="Main navigation"><Link href="/" className="nav-logo"><span className="brand-symbol" aria-hidden="true">W</span>Tech<span>Web</span></Link><ul className="nav-links"><li><Link href="/events">Competitions</Link></li><li><Link href="/teams">Find a team</Link></li><li><Link href="/#how-it-works">How it works</Link></li></ul><Link className="btn btn-sm btn-primary nav-account" href={user ? '/profile' : '/auth'}>{user ? 'My profile' : 'Join techweb'} ↗</Link></nav><main id="main-content">{children}</main><footer className="footer"><div className="container footer-content"><div><Link href="/" className="nav-logo">Tech<span>Web</span></Link><p>Find your people. Build what’s next.</p></div><div><Link href="/events">Competitions</Link><Link href="/teams">Teams</Link><Link href="/profile">Your profile</Link></div><span>Made for curious minds.<br />Built around complementary skills.</span></div></footer></body></html>;
}
