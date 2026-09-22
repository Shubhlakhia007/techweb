import Link from 'next/link';
import { eventModeLabel, eventScopeLabel } from '@/lib/events';

export function eventDate(date: string | null) {
  if (!date) return 'Date to be announced';
  const parsed = new Date(date + 'T12:00:00Z');
  if (Number.isNaN(parsed.getTime())) return 'Date to be announced';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

type EventCardData = {
  id: string; name: string; description: string | null; type: string; mode: string; scope: string;
  date: string | null; teamSizeMin: number; teamSizeMax: number;
  requiredSkills: { skillId: string; skill: { name: string } }[]; _count: { teams: number };
};
export function EventCard({ event, index = 0 }: { event: EventCardData; index?: number }) {
  const past = Boolean(event.date && event.date < new Date().toISOString().slice(0, 10));
  return <Link className="competition-card" href={'/events/' + event.id}>
    <div className={'competition-art art-' + index % 3} aria-hidden="true"><span>{event.type === 'ctf' ? '{ capture_the_flag }' : '< build_something />'}</span><span className="art-orbit" /></div>
    <div className="competition-body">
      <div className="tags"><span className="badge badge-orange">{event.type === 'ctf' ? 'CTF' : event.type === 'hackathon' ? 'Hackathon' : 'Competition'}</span><span className="badge badge-blue">{eventModeLabel(event.mode)}</span><span className="badge badge-neutral">{eventScopeLabel(event.scope)}</span><span className="badge badge-orange">Unverified</span>{past && <span className="badge badge-neutral">Started</span>}</div>
      <h3>{event.name}</h3><p>{event.description || 'A new challenge for your next team. Explore the skills and team requirements.'}</p>
      <div className="card-date">{eventDate(event.date)}</div>
      <div className="tags">{event.requiredSkills.slice(0, 3).map(s => <span className="badge badge-neutral" key={s.skillId}>{s.skill.name}</span>)}{event.requiredSkills.length > 3 && <span className="badge badge-neutral">+{event.requiredSkills.length - 3} skills</span>}</div>
      <div className="competition-bottom"><span>{event.teamSizeMin}–{event.teamSizeMax} members · {event._count.teams} teams</span><span aria-hidden="true">↗</span></div>
    </div>
  </Link>;
}

export function Pagination({ page, total, pageSize, path, filters }: { page: number; total: number; pageSize: number; path: string; filters: Record<string, string> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages < 2) return null;
  const href = (next: number) => path + '?' + new URLSearchParams({ ...filters, page: String(next) });
  return <nav className="pagination" aria-label="Results pages">{page > 1 ? <Link className="btn btn-secondary" href={href(page - 1)}>← Previous</Link> : <span /> }<span>Page {page} of {pages}</span>{page < pages ? <Link className="btn btn-secondary" href={href(page + 1)}>Next →</Link> : <span />}</nav>;
}

export function EmptyState({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌕</span><h2>{title}</h2><p>{description}</p><Link className="btn btn-secondary" href={href}>{label} →</Link></div>;
}
