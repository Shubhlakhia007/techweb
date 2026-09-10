import Link from 'next/link';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

const steps = [
  ['01', 'Start with what you know.', 'Add your skills, experience, location, and preferred event mode. Give future teammates a clear picture of you.', '/profile', 'Build your profile'],
  ['02', 'Find a challenge worth building for.', 'Explore hackathons and CTFs. Check the format, team size, and required skills before you commit.', '/events', 'Explore competitions'],
  ['03', 'Bring the missing skills together.', 'Create or join a team. See skill gaps and discover people whose strengths complement your team.', '/teams', 'Meet the teams'],
];

export default async function HomePage() {
  const [eventCount, teamCount, userCount, events, teams] = await Promise.all([
    prisma.event.count(), prisma.team.count(), prisma.user.count(),
    prisma.event.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { requiredSkills: { include: { skill: true } }, _count: { select: { teams: true } } } }),
    prisma.team.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { event: true, members: { include: { user: { select: { name: true } } } } } }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  return <div className="techweb-home">
    <section className="tw-hero container">
      <div className="hero-copy">
        <div className="eyebrow"><span className="tiny-dot" /> A NETWORK FOR PEOPLE WHO BUILD</div>
        <h1>Your next big idea<br />needs the <span>right people.</span></h1>
        <p>Turn “I need a team” into “let’s build.” Discover competitions, connect through your skills, and bring a balanced team together on techweb.</p>
        <div className="hero-actions"><Link className="btn btn-primary" href="/events">Find your next challenge <span aria-hidden="true">↗</span></Link><Link className="btn btn-secondary" href="/profile">Build your profile</Link></div>
        <div className="hero-footnote"><span>Hackathons</span><span>CTFs</span><span>Skill-based connections</span></div>
      </div>
      <div className="network-panel" aria-label="Illustration of complementary skills forming a team">
        <div className="panel-top"><span className="eyebrow">THE RIGHT CONNECTIONS</span><span className="mono">01 / TEAM DNA</span></div>
        <svg className="network-lines" viewBox="0 0 500 360" aria-hidden="true"><defs><linearGradient id="connection"><stop stopColor="#397bff"/><stop offset="1" stopColor="#9967ff"/></linearGradient></defs><circle cx="250" cy="180" r="118"/><circle cx="250" cy="180" r="65"/><path d="M100 85L250 180L402 84M250 180L100 282M250 180L402 280M100 85L402 84L402 280L100 282Z"/></svg>
        <div className="network-center"><span className="web-mark">W</span><strong>One team.<br />More possibilities.</strong></div>
        <div className="network-node node-one"><span className="node-icon">&lt;/&gt;</span><div><strong>Development</strong><small>Build the foundation</small></div></div>
        <div className="network-node node-two"><span className="node-icon violet">✧</span><div><strong>Design</strong><small>Make it intuitive</small></div></div>
        <div className="network-node node-three"><span className="node-icon violet">⌘</span><div><strong>Security</strong><small>Think a step ahead</small></div></div>
        <div className="network-node node-four"><span className="node-icon">▥</span><div><strong>Data & ML</strong><small>Find the insight</small></div></div>
        <div className="panel-bottom"><span className="tiny-dot" /> Different strengths. Shared ambition.<span>ILLUSTRATION</span></div>
      </div>
    </section>
    <section className="community-strip container" aria-label="Community statistics"><p>A small community.<br /><strong>Room for your next idea.</strong></p><div><strong>{userCount.toString().padStart(2, '0')}</strong><span>Member profiles</span></div><div><strong>{eventCount.toString().padStart(2, '0')}</strong><span>Listed competitions</span></div><div><strong>{teamCount.toString().padStart(2, '0')}</strong><span>Teams created</span></div></section>
    <section className="tw-section container" id="how-it-works"><div className="section-heading"><div><span className="eyebrow">FROM SOLO TO A SHARED GOAL</span><h2>A good team starts with a connection.</h2></div><p>You bring your strengths.<br />techweb helps you find the rest.</p></div><div className="steps-grid">{steps.map(([number, title, description, href, label]) => <article className="step-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p><Link href={href}>{label} <span aria-hidden="true">↗</span></Link></article>)}</div></section>
    <section className="tw-section competition-section"><div className="container"><div className="section-heading"><div><span className="eyebrow amber-text">FIND YOUR NEXT CHALLENGE</span><h2>Big problems. Fresh possibilities.</h2><p>Recently added competitions from the community.</p></div><Link className="text-link" href="/events">All competitions ↗</Link></div><div className="discovery-grid">{events.map((event, index) => <Link className="competition-card" href={'/events/' + event.id} key={event.id}><div className={'competition-art art-' + index}><span>{event.type === 'ctf' ? '{ capture_the_flag }' : '< build_something />'}</span><span className="badge badge-orange">{event.type === 'ctf' ? 'CTF' : 'Hackathon'}</span></div><div className="competition-body"><div className="card-kicker">{event.mode} <span>·</span> {event.date ? (event.date < today ? 'Past event · ' : 'Event date · ') + event.date : 'Date to be announced'}</div><h3>{event.name}</h3><p>{event.description || 'Explore this community challenge and its team requirements.'}</p><div className="tags">{event.requiredSkills.slice(0, 3).map(r => <span className="badge badge-blue" key={r.skillId}>{r.skill.name}</span>)}</div><div className="competition-bottom"><span>{event.teamSizeMin}–{event.teamSizeMax} per team · {event._count.teams} teams</span><span aria-hidden="true">↗</span></div></div></Link>)}</div>{!events.length && <div className="empty-state">The next challenge could be yours. <Link href="/create">Create the first competition ↗</Link></div>}</div></section>
    <section className="tw-section container"><div className="section-heading"><div><span className="eyebrow">BETTER TOGETHER</span><h2>Find a team to call yours.</h2><p>Explore the people, skill gaps, and requirements behind each team.</p></div><Link className="text-link" href="/teams">Explore teams ↗</Link></div><div className="discovery-grid">{teams.map(team => <Link className="team-preview" href={'/teams/' + team.id} key={team.id}><div className="team-preview-top"><div className="team-monogram">{team.name.slice(0, 2).toUpperCase()}</div><span className="badge badge-purple">{Math.max(0, team.event.teamSizeMax - team.members.length)} spaces left</span></div><h3>{team.name}</h3><p>{team.event.name}</p><div className="team-preview-bottom"><div className="avatar-stack">{team.members.slice(0, 4).map(m => <span key={m.id} title={m.user.name}>{m.user.name.slice(0, 1)}</span>)}</div><span>{team.members.length}/{team.event.teamSizeMax} members <b aria-hidden="true">↗</b></span></div></Link>)}</div>{!teams.length && <p className="empty-state">No teams yet. Choose a competition and start yours.</p>}</section>
    <section className="trust-section container"><div><span className="eyebrow">KNOW WHO YOU’RE BUILDING WITH</span><h2>Clear skills.<br />Better conversations.</h2><p>See what a team needs, how a candidate fits, and which requirements still need a conversation.</p><Link className="text-link" href="/profile">Make your strengths visible ↗</Link></div><div className="trust-items"><article><span className="trust-symbol">◎</span><div><h3>Matching you can understand</h3><p>Recommendations are based on missing skills and self-reported proficiency, so you can see why someone fits.</p></div></article><article><span className="trust-symbol verified-symbol">✓</span><div><h3>Verification should mean something <span className="soon-label">PLANNED</span></h3><p>Green is reserved for verified skills. Profiles currently show self-reported skills; skill verification is not available yet.</p></div></article><article><span className="trust-symbol">↔</span><div><h3>Check the details together</h3><p>Capacity, event preferences, and region rules are checked. Discuss travel, availability, and additional event requirements with your team.</p></div></article></div></section>
    <section className="start-banner container"><div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>You have the spark.<br />Find your people.</h2></div><div><Link className="btn btn-primary" href="/profile">Create your builder profile ↗</Link><p>Already have a challenge? <Link href="/create">Post an event.</Link></p></div></section>
  </div>;
}
