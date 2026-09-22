import Link from 'next/link';
import { prisma } from '@/lib/prisma';

/** Async server component — the 3 newest teams, streamed after the hero. */
export async function HomepageTeams() {
  const teams = await prisma.team.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      event: true,
      members: { include: { user: { select: { name: true } } } },
    },
  });
  return (
    <>
      <div className="discovery-grid">
        {teams.map(team => (
          <Link className="team-preview" href={'/teams/' + team.id} key={team.id}>
            <div className="team-preview-top">
              <div className="team-monogram">{team.name.slice(0, 2).toUpperCase()}</div>
              <span className="badge badge-purple">
                {Math.max(0, team.event.teamSizeMax - team.members.length)} spaces left
              </span>
            </div>
            <h3>{team.name}</h3>
            <p>{team.event.name}</p>
            <div className="team-preview-bottom">
              <div className="avatar-stack">
                {team.members.slice(0, 4).map(m => (
                  <span key={m.id} title={m.user.name}>{m.user.name.slice(0, 1)}</span>
                ))}
              </div>
              <span>
                {team.members.length}/{team.event.teamSizeMax} members{' '}
                <b aria-hidden="true">↗</b>
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!teams.length && (
        <p className="empty-state">No teams yet. Choose a competition and start yours.</p>
      )}
    </>
  );
}

/** Skeleton fallback while HomepageTeams fetches. */
export function HomepageTeamsSkeleton() {
  return (
    <div className="discovery-grid">
      {[0, 1, 2].map(i => (
        <div key={i} className="sk-card team-preview" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14 }} />
            <div className="skeleton sk-badge" />
          </div>
          <div className="skeleton sk-title" style={{ width: '70%', marginBottom: 10 }} />
          <div className="skeleton sk-text"  style={{ width: '55%', marginBottom: 18 }} />
          <div style={{ borderTop: '1px solid #273650', paddingTop: 18, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex' }}>
              {[0, 1, 2].map(j => (
                <div key={j} className="skeleton sk-avatar" style={{ marginLeft: j === 0 ? 0 : -6, border: '3px solid #101b30' }} />
              ))}
            </div>
            <div className="skeleton sk-text" style={{ width: 80 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
