import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { failure, HttpError, sameOrigin, text } from '@/lib/http';
export async function GET() {
  return Response.json(await prisma.team.findMany({ include: { event: true, members: { select: { userId: true, role: true, user: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } }));
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const b = await request.json();
    const eventId = text(b.eventId, 'Event');
    if (!await prisma.event.findUnique({ where: { id: eventId } })) throw new HttpError('Event not found.', 404);
    const team = await prisma.team.create({ data: { name: text(b.name, 'Team name', 80), eventId, createdBy: user.id, members: { create: { userId: user.id, role: 'leader' } } } });
    return Response.json(team, { status: 201 });
  } catch (error) { return failure(error); }
}
