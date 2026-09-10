import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { checkCandidateEligibility } from '@/lib/eligibility';
import { failure, HttpError, sameOrigin } from '@/lib/http';
export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const { teamId } = await params;
    await prisma.$transaction(async tx => {
      const team = await tx.team.findUnique({ where: { id: teamId }, include: { event: true, members: true } });
      if (!team) throw new HttpError('Team not found.', 404);
      if (team.members.some(m => m.userId === user.id)) throw new HttpError('You already belong to this team.', 409);
      const check = checkCandidateEligibility(user, team.event, team.members.length);
      if (!check.eligible) throw new HttpError(check.results.filter(r => r.status === 'fail').map(r => r.reason).join(' '), 409);
      await tx.teamMember.create({ data: { teamId, userId: user.id } });
    });
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
