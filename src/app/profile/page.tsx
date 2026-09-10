import { DataForm, ActionButton } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
export default async function ProfilePage() {
  const user = await currentUser(); if (!user) redirect('/auth');
  const [skills, profile] = await Promise.all([prisma.skill.findMany({ orderBy: { category: 'asc' } }), prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true, bio: true, location: true, timezone: true, eventPreference: true, experienceLevel: true, skills: { select: { skillId: true, proficiency: true } } } })]);
  return <div className="container"><div className="page-header section-header"><div><h1>Your profile</h1><p>Your skills help teams find the person they are missing.</p></div><ActionButton endpoint="/api/auth" label="Sign out" body={{ action: 'logout' }} destination="/" /></div><DataForm kind="profile" skills={skills} profile={profile} /></div>;
}
