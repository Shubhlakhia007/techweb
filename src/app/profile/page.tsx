import { DataForm, ActionButton } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { publicProfileSelect } from '@/lib/profile';
import { googleConfigured } from '@/lib/google';
import { redirect } from 'next/navigation';
export default async function ProfilePage() {
  const user = await currentUser(); if (!user) redirect('/auth');
  const [skills, profile] = await Promise.all([prisma.skill.findMany({ orderBy: { category: 'asc' } }), prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { ...publicProfileSelect, email: true, contactEmail: true } })]);
  return <div className="container"><div className="page-header section-header"><div><h1>Your profile</h1><p>Your skills help teams find the person they are missing.</p></div><ActionButton endpoint="/api/auth" label="Sign out" body={{ action: 'logout' }} destination="/" /></div><p className="profile-toolbar"><Link className="text-link" href={'/people/' + user.id}>View your public profile ↗</Link>{user.googleId ? <span>Google account connected</span> : googleConfigured() && <a className="text-link" href="/api/auth/google?next=/profile">Connect Google sign-in →</a>}</p><DataForm kind="profile" skills={skills} profile={profile} /></div>;
}
