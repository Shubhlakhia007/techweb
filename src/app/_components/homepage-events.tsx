import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/discovery';

/** Async server component — the 3 newest events, streamed after the hero. */
export async function HomepageEvents() {
  const events = await prisma.event.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      requiredSkills: { include: { skill: true } },
      _count: { select: { teams: true } },
    },
  });
  return (
    <>
      <div className="discovery-grid">
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>
      {!events.length && (
        <div className="empty-state">
          The next challenge could be yours.{' '}
          <Link href="/create">Create the first competition ↗</Link>
        </div>
      )}
    </>
  );
}

/** Skeleton fallback while HomepageEvents fetches. */
export function HomepageEventsSkeleton() {
  return (
    <div className="discovery-grid">
      {[0, 1, 2].map(i => (
        <div key={i} className="sk-card">
          <div className="skeleton sk-art" />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className="skeleton sk-badge" />
            <div className="skeleton sk-badge" />
          </div>
          <div className="skeleton sk-title" style={{ width: '80%', marginBottom: 10 }} />
          <div className="skeleton sk-text"  style={{ marginBottom: 6 }} />
          <div className="skeleton sk-text"  style={{ width: '65%' }} />
        </div>
      ))}
    </div>
  );
}
