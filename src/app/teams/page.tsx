import Link from 'next/link';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function TeamsPage() {
  const teams = await prisma.team.findMany({ include: { event: true, members: { include: { user: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } });
  return <div className="container"><div className="page-header section-header"><div><h1>Find your people</h1><p>Explore teams, see their skill gaps, and join one you can help.</p></div><Link className="btn btn-primary" href="/create?kind=team">Create team</Link></div><div className="card-grid">{teams.map(t => <Link className="card" href={'/teams/' + t.id} key={t.id}><div className="team-card-header"><h2>{t.name}</h2><span className="badge badge-purple">{t.members.length}/{t.event.teamSizeMax}</span></div><p className="team-event-name">{t.event.name}</p><p>{t.members.map(m => m.user.name).join(', ')}</p><p className="muted">View team dashboard →</p></Link>)}</div>{!teams.length && <p className="empty-state">No teams yet. Create one to get started.</p>}</div>;
}
