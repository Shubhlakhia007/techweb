import { prisma } from '@/lib/prisma';

/** Async server component — streamed independently so the hero renders immediately. */
export async function StatsStrip() {
  const [eventCount, teamCount, userCount] = await Promise.all([
    prisma.event.count(),
    prisma.team.count(),
    prisma.user.count(),
  ]);
  return (
    <section className="community-strip container" aria-label="Community statistics">
      <p>A small community.<br /><strong>Room for your next idea.</strong></p>
      <div><strong>{userCount.toString().padStart(2, '0')}</strong><span>Member profiles</span></div>
      <div><strong>{eventCount.toString().padStart(2, '0')}</strong><span>Listed competitions</span></div>
      <div><strong>{teamCount.toString().padStart(2, '0')}</strong><span>Teams created</span></div>
    </section>
  );
}

/** Fallback shown while StatsStrip is fetching. */
export function StatsStripSkeleton() {
  return (
    <section className="community-strip container" aria-label="Loading community statistics">
      <p><strong style={{ display: 'block', marginBottom: 6 }}>
        <span className="skeleton" style={{ display: 'inline-block', width: 200, height: 18, borderRadius: 6 }} />
      </strong></p>
      {[0, 1, 2].map(i => (
        <div key={i}>
          <span className="skeleton" style={{ display: 'block', width: 48, height: 36, borderRadius: 6, marginBottom: 8 }} />
          <span className="skeleton" style={{ display: 'block', width: 80, height: 13, borderRadius: 5 }} />
        </div>
      ))}
    </section>
  );
}
