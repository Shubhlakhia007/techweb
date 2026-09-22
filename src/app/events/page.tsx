import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { EmptyState, EventCard, Pagination } from '@/components/discovery';
export const dynamic = 'force-dynamic';

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const text = (key: string) => typeof query[key] === 'string' ? query[key].trim().slice(0, 100) : '';
  const q = text('q');
  const type = ['hackathon', 'ctf', 'competition'].includes(text('type')) ? text('type') : '';
  const mode = ['online', 'offline', 'hybrid'].includes(text('mode')) ? text('mode') : '';
  const scope = ['global', 'local'].includes(text('scope')) ? text('scope') : '';
  const timing = text('timing') === 'upcoming' ? 'upcoming' : '';
  const today = new Date().toISOString().slice(0, 10);
  const where: Prisma.EventWhereInput = {
    ...(type && { type }), ...(mode && { mode }), ...(scope && { scope }),
    ...(timing && { OR: [{ rounds: { some: { OR: [{ date: { gte: today } }, { date: null }] } } }, { rounds: { none: {} }, OR: [{ date: { gte: today } }, { date: null }, { date: '' }] }] }),
    ...(q && { AND: [{ OR: [{ name: { contains: q } }, { description: { contains: q } }, { requiredSkills: { some: { skill: { name: { contains: q } } } } }] }] }),
  };
  const pageSize = 12;
  const total = await prisma.event.count({ where });
  const page = Math.min(Math.max(1, Math.floor(Number(text('page')) || 1)), Math.max(1, Math.ceil(total / pageSize)));
  const events = await prisma.event.findMany({ where, take: pageSize, skip: (page - 1) * pageSize,
    include: { requiredSkills: { select: { skillId: true, skill: { select: { name: true } } } }, _count: { select: { teams: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  return <div className="container directory-page">
    <div className="page-header section-header"><div><span className="eyebrow amber-text">A CHALLENGE WORTH BUILDING FOR</span><h1>Find your next challenge<span className="heading-dot">.</span></h1><p>Explore hackathons and CTFs. Bring your curiosity. Find your team.</p></div><Link className="btn btn-primary" href="/create">+ Create event</Link></div>
    <form className="filters" action="/events" role="search" aria-label="Find competitions">
      <label className="search-field">Search competitions<input className="form-input" type="search" name="q" placeholder="Try Python, security, or an event name" defaultValue={q} maxLength={100} /></label>
      <label>Type<select className="form-select" name="type" defaultValue={type}><option value="">All types</option><option value="hackathon">Hackathon</option><option value="ctf">CTF</option><option value="competition">Other competition</option></select></label>
      <label>Format<select className="form-select" name="mode" defaultValue={mode}><option value="">Any format</option><option value="online">Online</option><option value="offline">In person</option><option value="hybrid">Online + in person</option></select></label>
      <label>Reach<select className="form-select" name="scope" defaultValue={scope}><option value="">Anywhere</option><option value="global">Global</option><option value="local">Local</option></select></label>
      <label>When<select className="form-select" name="timing" defaultValue={timing}><option value="">All dates</option><option value="upcoming">Upcoming / date TBA</option></select></label>
      <button className="btn btn-primary">Search</button>
    </form>
    <div className="results-bar"><p><strong>{total}</strong> {total === 1 ? 'competition' : 'competitions'}{q ? ` matching “${q}”` : ' to explore'}</p>{(q || type || mode || scope || timing) && <Link className="text-link" href="/events">Clear filters ×</Link>}</div>
    <div className="discovery-grid">{events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>
    {!total && <EmptyState title="No challenges found" description="Try another skill or remove a filter. You can also create a competition of your own." href="/events" label="Reset search" />}
    <Pagination page={page} total={total} pageSize={pageSize} path="/events" filters={{ q, type, mode, scope, timing }} />
  </div>;
}
