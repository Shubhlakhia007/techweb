import Link from 'next/link';
import { DataForm } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ kind?: string; eventId?: string }> }) {
  if (!await currentUser()) redirect('/auth');
  const query = await searchParams;
  const kind = query.kind === 'team' ? 'team' : 'event';
  const [skills, events] = await Promise.all([prisma.skill.findMany({ orderBy: { name: 'asc' } }), prisma.event.findMany({ select: { id: true, name: true }, orderBy: { createdAt: 'desc' } })]);
  return <div className="container"><div className="page-header"><h1>Create {kind === 'team' ? 'a team' : 'an event'}</h1><p>Define what you want to build and who you need.</p></div><div className="tabs"><Link className={'btn ' + (kind === 'event' ? 'btn-primary' : 'btn-secondary')} href="/create">Event</Link><Link className={'btn ' + (kind === 'team' ? 'btn-primary' : 'btn-secondary')} href="/create?kind=team">Team</Link></div><DataForm kind={kind} skills={skills} events={events} eventId={query.eventId} /></div>;
}
