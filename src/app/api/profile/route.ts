import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { choice, failure, HttpError, integer, sameOrigin, text } from '@/lib/http';
export async function GET() {
  try {
    const user = await requireUser();
    return Response.json(await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, bio: true, location: true, timezone: true, eventPreference: true, experienceLevel: true, skills: true } }));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const b = await request.json();
    const timezone = text(b.timezone, 'Timezone', 80, true);
    if (timezone) { try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { throw new HttpError('Enter an IANA timezone, such as Asia/Kolkata.'); } }
    if (!Array.isArray(b.skills) || b.skills.length > 50) throw new HttpError('Choose up to 50 skills.');
    const skills = b.skills.map((s: { skillId: unknown; proficiency: unknown }) => ({ skillId: text(s.skillId, 'Skill'), proficiency: integer(s.proficiency, 1, 5, 'Proficiency') }));
    if (new Set(skills.map((s: { skillId: string }) => s.skillId)).size !== skills.length) throw new HttpError('Duplicate skill.');
    if (await prisma.skill.count({ where: { id: { in: skills.map((s: { skillId: string }) => s.skillId) } } }) !== skills.length) throw new HttpError('Unknown skill.');
    await prisma.user.update({ where: { id: user.id }, data: {
      name: text(b.name, 'Name', 80), bio: text(b.bio, 'Bio', 1000, true) || null,
      location: text(b.location, 'Location', 100, true) || null, timezone: timezone || null,
      experienceLevel: choice(b.experienceLevel, ['beginner', 'intermediate', 'advanced'], 'experience level'),
      eventPreference: choice(b.eventPreference, ['online', 'offline', 'either'], 'event preference'),
      skills: { deleteMany: {}, create: skills },
    } });
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
