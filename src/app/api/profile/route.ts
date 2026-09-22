import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { choice, failure, HttpError, sameOrigin, text } from '@/lib/http';
import { emailAddress, publicProfileSelect, resolveSkills, skillNames, website } from '@/lib/profile';

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json(await prisma.user.findUnique({ where: { id: user.id }, select: { ...publicProfileSelect, email: true, contactEmail: true, emailVerified: true } }));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const b = await request.json();
    const timezone = text(b.timezone, 'Timezone', 80, true);
    if (timezone) { try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { throw new HttpError('Enter an IANA timezone, such as Asia/Kolkata.'); } }
    const names = skillNames(b.skills);
    if (!Array.isArray(b.links) || b.links.length > 10) throw new HttpError('Add up to 10 work or research links.');
    const links = b.links.map((link: { label?: unknown; url?: unknown } | null) => {
      if (!link) throw new HttpError('Invalid work link.');
      const url = website(link.url, 'Work link');
      if (!url) throw new HttpError('Enter a URL for each work link.');
      return { label: text(link.label, 'Link title', 80), url };
    });
    const data = {
      name: text(b.name, 'Name', 80), bio: text(b.bio, 'Bio', 1000, true) || null,
      location: text(b.location, 'Location', 100, true) || null, timezone: timezone || null,
      contactEmail: emailAddress(b.contactEmail), linkedinUrl: website(b.linkedinUrl, 'LinkedIn'), githubUrl: website(b.githubUrl, 'GitHub'),
      eventPreference: choice(b.eventPreference, ['online', 'offline', 'either'], 'event preference'),
    };
    await prisma.$transaction(async tx => {
      const ids = await resolveSkills(tx, names);
      await tx.user.update({ where: { id: user.id }, data: { ...data,
        skills: { deleteMany: {}, create: ids.map(skillId => ({ skillId })) },
        links: { deleteMany: {}, create: links },
      } });
    });
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
