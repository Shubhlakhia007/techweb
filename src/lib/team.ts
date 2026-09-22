import { prisma } from './prisma';
import { computeTeamVector, computeGapVector, rankCandidates } from './matching';
import { checkCandidateEligibility, checkTeamEligibility } from './eligibility';
import { HttpError } from './http';
export async function teamDashboard(id: string) {
  const team = await prisma.team.findUnique({ where: { id }, include: { event: { include: { requiredSkills: { include: { skill: true } } } }, members: { include: { user: { select: { id: true, name: true, location: true, timezone: true, eventPreference: true, skills: { select: { skillId: true } } } } } } } });
  if (!team) throw new HttpError('Team not found.', 404);
  const requirements = team.event.requiredSkills.map(r => ({ ...r, skillName: r.skill.name }));
  const vector = computeTeamVector(team.members.map(m => ({ userId: m.userId, skills: m.user.skills })));
  const gap = computeGapVector(vector, requirements);
  const pool = await prisma.user.findMany({ select: { id: true, name: true, image: true, location: true, timezone: true, eventPreference: true, skills: { select: { skillId: true } } } });
  const candidates = pool.filter(c => checkCandidateEligibility(c, team.event, team.members.length).eligible);
  const recommendations = rankCandidates(candidates, new Set(team.members.map(m => m.userId)), gap, requirements).slice(0, 10);
  return { team, coverage: requirements.map(r => ({ skillId: r.skillId, name: r.skillName, required: r.minCount, covered: vector.get(r.skillId) ?? 0 })), recommendations, eligibility: checkTeamEligibility(team.members.length, team.event) };
}
