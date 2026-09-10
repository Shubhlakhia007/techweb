export type Rule = { rule: string; status: 'pass' | 'fail' | 'manual'; reason: string };
export type EventRules = { teamSizeMin: number; teamSizeMax: number; mode: string; diversityRuleText: string | null; regionRestriction: string | null; location: string | null };
export type CandidateInfo = { location: string | null; timezone: string | null; eventPreference: string | null };
export function checkTeamEligibility(count: number, event: EventRules): Rule[] {
  const results: Rule[] = [{ rule: 'Team size', status: count >= event.teamSizeMin && count <= event.teamSizeMax ? 'pass' : 'fail', reason: count + ' members; requires ' + event.teamSizeMin + '–' + event.teamSizeMax + '.' }];
  if (event.diversityRuleText) results.push({ rule: 'Event requirement', status: 'manual', reason: event.diversityRuleText });
  return results;
}
export function checkCandidateEligibility(candidate: CandidateInfo, event: EventRules, count: number) {
  const results: Rule[] = [];
  if (count >= event.teamSizeMax) results.push({ rule: 'Capacity', status: 'fail', reason: 'This team is full.' });
  if (candidate.eventPreference && candidate.eventPreference !== 'either' && candidate.eventPreference !== event.mode) results.push({ rule: 'Event mode', status: 'fail', reason: 'Event mode does not match your profile preference.' });
  if (event.regionRestriction) {
    // Exact region tokens avoid matching "York" with "New York". Missing data cannot pass a hard restriction.
    const regions = candidate.location?.split(',').map(s => s.trim().toLowerCase()) ?? [];
    if (!regions.includes(event.regionRestriction.trim().toLowerCase())) results.push({ rule: 'Region', status: 'fail', reason: 'Profile location must include the region: ' + event.regionRestriction });
  }
  if (event.mode === 'offline') results.push({ rule: 'Travel', status: 'manual', reason: 'Confirm you can travel to ' + (event.location || 'the venue') + '. Travel distance is not automatically verified.' });
  else results.push({ rule: 'Availability', status: 'manual', reason: 'Agree on working hours with the team. Timezone alone does not establish availability.' });
  return { eligible: !results.some(r => r.status === 'fail'), results };
}
