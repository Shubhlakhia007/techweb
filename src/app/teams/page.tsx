import Link from 'next/link';
import { eventModeLabel } from '@/lib/events';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { EmptyState, Pagination } from '@/components/discovery';
export const dynamic = 'force-dynamic';

export default async function TeamsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const mode = query.mode === 'online' || query.mode === 'offline' || query.mode === 'hybrid' ? query.mode : '';
  const where: Prisma.TeamWhereInput = { ...(mode && { event: { mode } }), ...(q && { OR: [{ name: { contains: q } }, { event: { name: { contains: q } } }] }) };
  const pageSize = 12;
  const total = await prisma.team.count({ where });
  const requestedPage = typeof query.page === 'string' ? Number(query.page) : 1;
  const page = Math.min(Math.max(1, Math.floor(requestedPage || 1)), Math.max(1, Math.ceil(total / pageSize)));
  const teams = await prisma.team.findMany({ where, take: pageSize, skip: (page - 1) * pageSize,
    select: { id: true, name: true, event: { select: { name: true, mode: true, teamSizeMax: true } }, _count: { select: { members: true } }, members: { take: 4, orderBy: { joinedAt: 'asc' }, select: { id: true, user: { select: { name: true } } } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  return <div className="container directory-page">
    <div className="page-header section-header"><div><span className="eyebrow">GREAT THINGS ARE BUILT TOGETHER</span><h1>Find your people<span className="heading-dot">.</span></h1><p>Different skills. A shared goal. Discover where you could make a difference.</p></div><Link className="btn btn-primary" href="/create?kind=team">+ Create team</Link></div>
    <form className="filters" action="/teams" role="search" aria-label="Find teams"><label className="search-field">Search teams<input type="search" className="form-input" name="q" defaultValue={q} maxLength={100} placeholder="Search by team or competition" /></label><label>Event format<select className="form-select" name="mode" defaultValue={mode}><option value="">Any format</option><option value="online">Online</option><option value="offline">In person</option><option value="hybrid">Online + in person</option></select></label><button className="btn btn-primary">Search</button></form>
    <div className="results-bar"><p><strong>{total}</strong> {total === 1 ? 'team' : 'teams'}{q ? ` matching “${q}”` : ' in the community'}</p>{(q || mode) && <Link className="text-link" href="/teams">Clear filters ×</Link>}</div>
    <div className="discovery-grid">{teams.map(team => {
      const spaces = Math.max(0, team.event.teamSizeMax - team._count.members);
      return <Link className="team-preview" href={'/teams/' + team.id} key={team.id}>
        <div className="team-preview-top"><span className="team-monogram" aria-hidden="true">{team.name.slice(0, 2).toUpperCase()}</span><span className={'badge ' + (spaces ? 'badge-purple' : 'badge-neutral')}>{spaces ? `${spaces} open ${spaces === 1 ? 'spot' : 'spots'}` : 'Team full'}</span></div>
        <h2>{team.name}</h2><p>{team.event.name}</p><span className="badge badge-blue">{eventModeLabel(team.event.mode)}</span>
        <div className="team-preview-bottom"><div className="avatar-stack" aria-label="Team members">{team.members.map(m => <span key={m.id} title={m.user.name}>{m.user.name.slice(0, 1)}</span>)}</div><span>{team._count.members}/{team.event.teamSizeMax} members</span></div><div className="team-card-link">Explore skills & team <span aria-hidden="true">↗</span></div>
      </Link>;
    })}</div>
    {!total && <EmptyState title="Your people are out there" description="Try a different team name or event. Or start a team and make the first connection." href={q || mode ? '/teams' : '/create?kind=team'} label={q || mode ? 'Reset search' : 'Create a team'} />}
    <Pagination page={page} total={total} pageSize={pageSize} path="/teams" filters={{ q, mode }} />
  </div>;
}
