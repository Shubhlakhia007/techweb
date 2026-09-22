import Link from 'next/link';
import { DataForm } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ kind?: string; eventId?: string }> }) {
  const query = await searchParams;
  if (!await currentUser()) redirect('/auth?next=' + encodeURIComponent('/create?' + new URLSearchParams({ kind: query.kind === 'team' ? 'team' : 'event', ...(query.eventId ? { eventId: query.eventId } : {}) })));
  const kind = query.kind === 'team' ? 'team' : 'event';
  const [skills, events] = await Promise.all([prisma.skill.findMany({ orderBy: { name: 'asc' } }), prisma.event.findMany({ select: { id: true, name: true }, orderBy: { createdAt: 'desc' } })]);
  return <div className="container"><div className="page-header"><h1>Create {kind === 'team' ? 'a team' : 'a competition'}</h1><p>Set the reach, round formats, and skills your competition needs.</p></div><div className="tabs"><Link className={'btn ' + (kind === 'event' ? 'btn-primary' : 'btn-secondary')} href="/create">Competition</Link><Link className={'btn ' + (kind === 'team' ? 'btn-primary' : 'btn-secondary')} href="/create?kind=team">Team</Link></div><DataForm kind={kind} skills={skills} events={events} eventId={query.eventId} /></div>;
}
