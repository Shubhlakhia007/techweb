import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { choice, failure, HttpError, integer, sameOrigin, text } from '@/lib/http';
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  return Response.json(await prisma.event.findMany({ where: { ...(q.get('type') ? { type: q.get('type')! } : {}), ...(q.get('mode') ? { mode: q.get('mode')! } : {}) }, include: { creator: { select: { id: true, name: true } }, requiredSkills: { include: { skill: true } }, _count: { select: { teams: true } } }, orderBy: { createdAt: 'desc' } }));
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const b = await request.json();
    const min = integer(b.teamSizeMin, 1, 20, 'Minimum team size');
    const max = integer(b.teamSizeMax, min, 20, 'Maximum team size');
    const mode = choice(b.mode, ['online', 'offline'], 'event mode');
    const location = text(b.location, 'Location', 100, mode === 'online');
    const date = text(b.date, 'Date', 10, true);
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw new HttpError('Enter a valid date.');
    if (!Array.isArray(b.requiredSkills) || !b.requiredSkills.length || b.requiredSkills.length > 50) throw new HttpError('Choose at least one required skill (maximum 50).');
    const requiredSkills = b.requiredSkills.map((s: { skillId: unknown; minCount: unknown }) => ({ skillId: text(s.skillId, 'Skill'), minCount: integer(s.minCount, 1, max, 'Required members') }));
    const ids: string[] = requiredSkills.map((s: { skillId: string }) => s.skillId);
    if (new Set(ids).size !== ids.length || await prisma.skill.count({ where: { id: { in: ids } } }) !== ids.length) throw new HttpError('Invalid or duplicate skills.');
    const event = await prisma.event.create({ data: { name: text(b.name, 'Name', 120), description: text(b.description, 'Description', 2000, true) || null, type: choice(b.type, ['hackathon', 'ctf'], 'event type'), mode, teamSizeMin: min, teamSizeMax: max, location: location || null, date: date || null, regionRestriction: text(b.regionRestriction, 'Region restriction', 100, true) || null, diversityRuleText: text(b.diversityRuleText, 'Manual rule', 500, true) || null, createdBy: user.id, requiredSkills: { create: requiredSkills } } });
    return Response.json(event, { status: 201 });
  } catch (error) { return failure(error); }
}
