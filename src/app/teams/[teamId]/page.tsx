import Link from 'next/link';
import { notFound } from 'next/navigation';
import { teamDashboard } from '@/lib/team';
import { currentUser } from '@/lib/auth';
import { HttpError } from '@/lib/http';
import { checkCandidateEligibility } from '@/lib/eligibility';
import { ActionButton } from '@/components/forms';
export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const id = (await params).teamId;
  const data = await teamDashboard(id).catch(e => { if (e instanceof HttpError && e.status === 404) notFound(); throw e; });
  const { team, coverage, recommendations, eligibility } = data;
  const user = await currentUser();
  const member = team.members.some(m => m.userId === user?.id);
  const check = user ? checkCandidateEligibility(user, team.event, team.members.length) : null;
  const satisfied = coverage.filter(c => c.covered >= c.required).length;
  return <div className="container"><div className="page-header"><Link href={'/events/' + team.eventId}>← {team.event.name}</Link><h1>{team.name}</h1><p>{team.members.length}/{team.event.teamSizeMax} members · {satisfied}/{coverage.length} skill requirements met</p></div>
    <div className="dashboard-grid"><section className="card"><h2>Team members</h2><ul className="member-list">{team.members.map(m => <li className="member-item" key={m.id}><span>{m.user.name}</span><span className="member-role">{m.role}</span></li>)}</ul>{member ? <p className="notice">You are a member of this team.</p> : !user ? <Link className="btn btn-primary" href="/auth">Sign in to join</Link> : check?.eligible ? <><p className="muted">Discuss availability and any manual event requirements with the team.</p><ActionButton endpoint={'/api/teams/' + id + '/join'} label="Join this team" /></> : <p className="notice error">{check?.results.filter(r => r.status === 'fail').map(r => r.reason).join(' ')}</p>}</section>
    <section className="card"><h2>Event eligibility</h2>{eligibility.map((r, i) => <div className="rule" key={i}><span className={'badge ' + (r.status === 'pass' ? 'badge-blue' : 'badge-orange')}>{r.status === 'manual' ? 'Needs confirmation' : r.status === 'pass' ? 'Met' : 'Incomplete'}</span><p>{r.reason}</p></div>)}<p className="muted">Joining eligibility and final event eligibility are checked separately.</p></section></div>
    <section className="section"><h2>Skills covered, skills missing</h2><div className="card-grid">{coverage.map(c => <div className="card" key={c.skillId}><div className="section-header"><h3>{c.name}</h3><span>{c.covered}/{c.required}</span></div><progress value={Math.min(c.covered, c.required)} max={c.required} aria-label={c.name + ' coverage'} /><p className="muted">{c.covered >= c.required ? 'Covered' : 'Need ' + (c.required - c.covered) + ' more member(s)'}</p></div>)}</div>{!coverage.length && <p className="notice">This event has no requirements, so matching is unavailable. Create an event with required skills to use matching.</p>}</section>
    <section><h2>People who fill the gaps</h2><p className="muted">Ranked by proficiency in missing skills. Current members, full teams, and incompatible mode/region preferences are excluded. Availability and travel need manual confirmation.</p><div className="card-grid">{recommendations.map(r => <article className="card" key={r.user.id}><h3>{r.user.name}</h3><p className="muted">{r.user.location || 'Location not provided'} · {r.user.timezone || 'Timezone not provided'}</p><div className="tags">{r.matchingSkills.map(s => <span className="badge badge-blue" key={s.skillId}>{s.skillName} · {s.proficiency}/5</span>)}</div><p className="event-meta">Gap score: {r.score.toFixed(1)}</p></article>)}</div>{!recommendations.length && <p className="empty-state">{team.members.length >= team.event.teamSizeMax ? 'This team is full.' : 'No eligible candidates currently fill the remaining gaps.'}</p>}</section>
  </div>;
}
