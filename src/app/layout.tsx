import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { currentUser } from '@/lib/auth';
import { Navigation } from '@/components/navigation';
export const metadata: Metadata = {
  title: 'techweb — Find your people. Build what’s next.',
  description: 'Discover hackathons and CTFs, share your skills, and build a team with complementary strengths on techweb.',
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to content</a><Navigation signedIn={Boolean(user)} /><main id="main-content" tabIndex={-1}>{children}</main><footer className="footer"><div className="container footer-content"><div><Link href="/" className="nav-logo">tech<span>web</span></Link><p>Find your people. Build what’s next.</p></div><div><Link href="/events">Competitions</Link><Link href="/teams">Teams</Link><Link href="/profile">Your profile</Link></div><span>Different strengths.<br />Shared ambition.</span></div></footer></body></html>;
}
