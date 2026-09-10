/**
 * techweb Matching Engine — Pure rule-based, no AI/LLM calls.
 * Computes skill gaps and ranks candidates by how well they fill those gaps.
 */

type MemberSkill = {
  skillId: string;
  proficiency: number;
};

type TeamMember = {
  userId: string;
  skills: MemberSkill[];
};

type RequiredSkill = {
  skillId: string;
  minCount: number;
  skillName?: string;
};

type Candidate = {
  id: string;
  name: string | null;
  image: string | null;
  location: string | null;
  timezone: string | null;
  eventPreference: string | null;
  skills: MemberSkill[];
};

export type ScoredCandidate = {
  user: Candidate;
  score: number;
  matchingSkills: { skillId: string; skillName: string; proficiency: number }[];
};

/**
 * Count how many members have each skill.
 */
export function computeTeamVector(
  members: TeamMember[]
): Map<string, number> {
  const vector = new Map<string, number>();
  for (const member of members) {
    for (const skill of member.skills) {
      vector.set(skill.skillId, (vector.get(skill.skillId) ?? 0) + 1);
    }
  }
  return vector;
}

/**
 * Compute the gap between required skills and current team coverage.
 */
export function computeGapVector(
  teamVector: Map<string, number>,
  requiredSkills: RequiredSkill[]
): Map<string, number> {
  const gap = new Map<string, number>();
  for (const rs of requiredSkills) {
    const covered = teamVector.get(rs.skillId) ?? 0;
    const remaining = Math.max(rs.minCount - covered, 0);
    if (remaining > 0) {
      gap.set(rs.skillId, remaining);
    }
  }
  return gap;
}

/**
 * Score a single candidate by how well they fill the skill gaps.
 * Proficiency is used as a weight — higher proficiency = higher contribution.
 */
export function candidateScore(
  candidate: Candidate,
  gapVector: Map<string, number>,
  requiredSkills: RequiredSkill[]
): ScoredCandidate {
  let score = 0;
  const matchingSkills: ScoredCandidate["matchingSkills"] = [];

  for (const skill of candidate.skills) {
    if (gapVector.has(skill.skillId) && (gapVector.get(skill.skillId) ?? 0) > 0) {
      // Weight by proficiency (1-5) normalized to 0.2-1.0
      const weight = skill.proficiency / 5;
      score += weight;

      const skillInfo = requiredSkills.find(
        (rs) => rs.skillId === skill.skillId
      );
      matchingSkills.push({
        skillId: skill.skillId,
        skillName: skillInfo?.skillName ?? skill.skillId,
        proficiency: skill.proficiency,
      });
    }
  }

  return {
    user: candidate,
    score,
    matchingSkills,
  };
}

/**
 * Rank all eligible candidates by their gap-filling score.
 * Candidates already in the team or with score 0 are excluded.
 */
export function rankCandidates(
  candidates: Candidate[],
  teamMemberIds: Set<string>,
  gapVector: Map<string, number>,
  requiredSkills: RequiredSkill[]
): ScoredCandidate[] {
  return candidates
    .filter((c) => !teamMemberIds.has(c.id))
    .map((c) => candidateScore(c, gapVector, requiredSkills))
    .filter((sc) => sc.score > 0)
    .sort((a, b) => b.score - a.score);
}
