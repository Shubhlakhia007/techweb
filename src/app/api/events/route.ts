import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { choice, failure, HttpError, integer, sameOrigin, text } from '@/lib/http';
import { resolveSkills, skillNames, website } from '@/lib/profile';
import { eventRounds } from '@/lib/events';
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  return Response.json(await prisma.event.findMany({ where: { ...(q.get('type') ? { type: q.get('type')! } : {}), ...(q.get('mode') ? { mode: q.get('mode')! } : {}), ...(q.get('scope') ? { scope: q.get('scope')! } : {}) }, include: { creator: { select: { id: true, name: true } }, rounds: { orderBy: { position: 'asc' } }, requiredSkills: { include: { skill: true } }, _count: { select: { teams: true } } }, orderBy: { createdAt: 'desc' } }));
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const b = await request.json();
    const min = integer(b.teamSizeMin, 1, 20, 'Minimum team size');
    const max = integer(b.teamSizeMax, min, 20, 'Maximum team size');
    const rounds = eventRounds(b.rounds);
    const modes = new Set(rounds.map(r => r.mode));
    const mode = modes.size > 1 ? 'hybrid' : rounds[0].mode;
    const scope = choice(b.scope, ['global', 'local'], 'event reach');
    const localArea = text(b.localArea, 'Local area / community', 200, scope !== 'local');
    if (!Array.isArray(b.requiredSkills) || !b.requiredSkills.length) throw new HttpError('Add at least one required skill.');
    const names = skillNames(b.requiredSkills.map((s: { name?: unknown } | null) => s?.name));
    const counts = b.requiredSkills.map((s: { minCount: unknown }) => integer(s.minCount, 1, max, 'Required members'));
    const data = { name: text(b.name, 'Name', 120), description: text(b.description, 'Description', 2000, true) || null,
      type: choice(b.type, ['hackathon', 'ctf', 'competition'], 'event type'), mode, scope, localArea: scope === 'local' ? localArea : null,
      websiteUrl: website(b.websiteUrl, 'Official event website'), teamSizeMin: min, teamSizeMax: max,
      location: rounds.find(r => r.mode === 'offline')?.location || null, date: rounds[0].date,
      regionRestriction: text(b.regionRestriction, 'Region restriction', 100, true) || null,
      diversityRuleText: text(b.diversityRuleText, 'Manual rule', 500, true) || null, createdBy: user.id };
    const event = await prisma.$transaction(async tx => {
      const ids = await resolveSkills(tx, names);
      return tx.event.create({ data: { ...data, rounds: { create: rounds },
        requiredSkills: { create: ids.map((skillId, i) => ({ skillId, minCount: counts[i] })) } } });
    });
    return Response.json(event, { status: 201 });
  } catch (error) { return failure(error); }
}
