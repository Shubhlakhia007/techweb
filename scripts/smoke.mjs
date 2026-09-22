import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const prefix = `smoke-${Date.now()}`;
const emails = [1, 2, 3].map(i => `${prefix}-${i}@example.com`);
const cookies = ['', '', ''];
async function request(path, body, user = 0, status = 200) {
  const res = await fetch(base + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', origin: base, cookie: cookies[user] }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  assert.equal(res.status, status, JSON.stringify(data));
  const cookie = res.headers.get('set-cookie');
  if (cookie) cookies[user] = cookie.split(';')[0];
  return data;
}
try {
  await request('/api/profile', undefined, 0, 401);
  for (let i = 0; i < 3; i++) await request('/api/auth', { action: 'register', email: emails[i], name: `${prefix}-${i}`, password: 'Test-only-password-123' }, i);
  const skills = await request('/api/skills');
  await request('/api/profile', { name: prefix, bio: '', location: 'Delhi, India', timezone: 'Asia/Kolkata', contactEmail: emails[1], linkedinUrl: 'https://www.linkedin.com/in/test', githubUrl: 'https://github.com/test', links: [{ label: 'Published research', url: 'https://example.com/paper' }], eventPreference: 'either', skills: [skills[0].name] }, 1);
  const eventData = { name: prefix, type: 'hackathon', scope: 'global', rounds: [{ name: 'Qualifier', mode: 'online', date: '', location: '' }], teamSizeMin: 2, teamSizeMax: 2, requiredSkills: [{ name: skills[0].name, minCount: 1 }] };
  await request('/api/events', { ...eventData, teamSizeMin: 3 }, 0, 400);
  const event = await request('/api/events', eventData, 0, 201);
  const team = await request('/api/teams', { name: prefix, eventId: event.id }, 0, 201);
  // Exercise real server filtering and page boundaries with disposable fixtures.
  const creator = await db.user.findUniqueOrThrow({ where: { email: emails[0] } });
  await db.event.createMany({ data: Array.from({ length: 12 }, (_, i) => ({
    name: `${prefix}-past-${i}`, type: 'ctf', mode: 'offline', date: '2000-01-01',
    location: 'Delhi, India', createdBy: creator.id,
  })) });
  async function cards(path, className) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    return ((await response.text()).match(new RegExp(`class="${className}"`, 'g')) || []).length;
  }
  assert.equal(await cards(`/events?q=${prefix}`, 'competition-card'), 12);
  assert.equal(await cards(`/events?q=${prefix}&page=2`, 'competition-card'), 1);
  assert.equal(await cards(`/events?q=${prefix}&page=999`, 'competition-card'), 1);
  assert.equal(await cards(`/events?q=${prefix}&page=-1`, 'competition-card'), 12);
  assert.equal(await cards(`/events?q=${prefix}&timing=upcoming`, 'competition-card'), 1);
  assert.equal(await cards(`/events?q=${prefix}&type=ctf&mode=offline`, 'competition-card'), 12);
  assert.equal(await cards(`/events?q=${prefix}-does-not-exist`, 'competition-card'), 0);
  assert.equal(await cards(`/teams?q=${prefix}&mode=online`, 'team-preview'), 1);
  assert.equal(await cards(`/teams?q=${prefix}&mode=offline`, 'team-preview'), 0);
  const createRedirect = await fetch(base + `/create?kind=team&eventId=${event.id}`, { redirect: 'manual' });
  // A streamed Next.js page redirects with a refresh meta tag after headers are sent.
  assert.ok([200, 307].includes(createRedirect.status));
  const redirectHtml = await createRedirect.text();
  const redirectTarget = createRedirect.headers.get('location') || redirectHtml.match(/id="__next-page-redirect"[^>]*content="[^;]+;url=([^"]+)"/)?.[1];
  assert.ok(redirectTarget, 'The page must preserve a sign-in destination');
  const authLocation = new URL(redirectTarget.replaceAll('&amp;', '&'), base);
  assert.equal(authLocation.pathname, '/auth');
  assert.equal(authLocation.searchParams.get('next'), `/create?kind=team&eventId=${event.id}`);
  const recommendations = await request(`/api/teams/${team.id}/recommendations`);
  assert.ok(JSON.stringify(recommendations).includes(prefix + '-1') || JSON.stringify(recommendations).includes(prefix));
  await request(`/api/teams/${team.id}/join`, {}, 1);
  await request(`/api/teams/${team.id}/join`, {}, 1, 409);
  await request(`/api/teams/${team.id}/join`, {}, 2, 409);
  for (const path of ['/', '/events', '/teams', '/auth', '/profile', '/create', `/events/${event.id}`, `/teams/${team.id}`]) {
    const res = await fetch(base + path, { headers: { cookie: cookies[0] } });
    assert.equal(res.status, 200, path);
  }
  const person = await db.user.findUniqueOrThrow({ where: { email: emails[1] } });
  const publicHtml = await (await fetch(base + '/people/' + person.id)).text();
  assert.ok(!publicHtml.includes(emails[1]), 'Guests cannot read contact email, including serialized page data');
  assert.ok(publicHtml.includes('Published research'));
  const memberHtml = await (await fetch(base + '/people/' + person.id, { headers: { cookie: cookies[0] } })).text();
  assert.ok(memberHtml.includes('mailto:' + emails[1]));
  const profile = await request('/api/profile', undefined, 1);
  assert.equal(profile.skills[0].skill.name, skills[0].name);
  assert.ok(!('experienceLevel' in profile));
  assert.ok(!('proficiency' in profile.skills[0]));
  const newSkill = prefix + '-research';
  const profileData = { name: prefix, location: 'Delhi, India', timezone: 'Asia/Kolkata', eventPreference: 'either', contactEmail: emails[1], skills: [newSkill], links: [] };
  await request('/api/profile', { ...profileData, contactEmail: '' }, 1, 400);
  await request('/api/profile', { ...profileData, githubUrl: 'javascript:alert(1)' }, 1, 400);
  await request('/api/profile', { ...profileData, links: [null] }, 1, 400);
  await request('/api/profile', { ...profileData, skills: [newSkill, newSkill.toUpperCase()] }, 1, 400);
  await request('/api/profile', profileData, 1);
  const savedProfile = await request('/api/profile', undefined, 1);
  assert.equal(savedProfile.links.length, 0, 'Removing work links persists');
  assert.equal(savedProfile.skills.length, 1, 'Replacing skills removes old associations');
  const hybridData = { ...eventData, name: prefix + '-mixed', scope: 'local', localArea: 'Delhi colleges', requiredSkills: [{ name: newSkill.toUpperCase(), minCount: 1 }],
    websiteUrl: 'https://example.com/event', rounds: [{ name: 'Online qualifier', mode: 'online', date: '2000-01-01' }, { name: 'Campus final', mode: 'offline', date: '2030-02-01', location: 'Delhi, India' }] };
  await request('/api/events', { ...hybridData, localArea: '' }, 0, 400);
  await request('/api/events', { ...hybridData, rounds: [hybridData.rounds[0], { ...hybridData.rounds[1], location: '' }] }, 0, 400);
  await request('/api/events', { ...hybridData, rounds: [...hybridData.rounds].reverse() }, 0, 400);
  await request('/api/events', { ...hybridData, rounds: [{ ...hybridData.rounds[0], date: '2030-02-30' }] }, 0, 400);
  const mixed = await request('/api/events', { ...hybridData, mode: 'online', verificationStatus: 'verified' }, 0, 201);
  assert.equal(mixed.mode, 'hybrid', 'Overall mode comes from actual rounds');
  assert.equal(mixed.verificationStatus, 'unverified');
  assert.equal(await db.skill.count({ where: { name: newSkill } }), 1, 'Custom skill canonicalized across profiles and events');
  const mixedTeam = await request('/api/teams', { name: prefix + '-mixed', eventId: mixed.id }, 0, 201);
  const mixedRecommendations = await request('/api/teams/' + mixedTeam.id + '/recommendations');
  const candidate = mixedRecommendations.recommendations.find(r => r.user.id === person.id);
  assert.equal(candidate.score, 1);
  assert.ok(!JSON.stringify(candidate).includes('proficiency'));
  assert.equal(await cards(`/events?q=${prefix}&mode=hybrid&scope=local`, 'competition-card'), 1);
  assert.equal(await cards(`/events?q=${prefix}-mixed&timing=upcoming`, 'competition-card'), 1, 'Events with a future final remain discoverable after qualifying begins');
  const mixedPage = await (await fetch(base + '/events/' + mixed.id)).text();
  assert.ok(mixedPage.includes('Campus final') && mixedPage.includes('In person required') && mixedPage.includes('Unverified listing'));
  await request('/api/profile', { ...profileData, contactEmail: emails[2], eventPreference: 'online' }, 2);
  await request('/api/teams/' + mixedTeam.id + '/join', {}, 2, 409);
  await request('/api/teams/' + mixedTeam.id + '/join', {}, 1);
  const anonUsers = await (await fetch(base + '/api/users')).text();
  assert.ok(!anonUsers.includes('contactEmail') && !anonUsers.includes('passwordHash') && !anonUsers.includes('googleId'));
  const oauthFailure = await fetch(base + '/api/auth/google/callback?code=invalid&state=invalid', { redirect: 'manual' });
  assert.equal(oauthFailure.status, 307);
  assert.equal(new URL(oauthFailure.headers.get('location'), base).pathname, '/auth');
  await request('/api/auth', { action: 'logout' });
  await request('/api/profile', undefined, 0, 401);
  await request('/api/auth', { action: 'login', email: emails[0], password: 'Test-only-password-123' });
  console.log('PASS: auth, flexible skills, work links, private contact email, hybrid rounds, validation, scope filters, matching, membership, pagination, OAuth failure handling, and page rendering.');
} finally {
  const users = await db.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const ids = users.map(u => u.id);
  await db.team.deleteMany({ where: { createdBy: { in: ids } } });
  await db.event.deleteMany({ where: { createdBy: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.skill.deleteMany({ where: { name: { startsWith: prefix } } });
  await db.$disconnect();
}
