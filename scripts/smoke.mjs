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
  const skillId = skills[0].id;
  await request('/api/profile', { name: prefix, bio: '', location: 'Delhi, India', timezone: 'Asia/Kolkata', experienceLevel: 'intermediate', eventPreference: 'either', skills: [{ skillId, proficiency: 4 }] }, 1);
  const eventData = { name: prefix, type: 'hackathon', mode: 'online', teamSizeMin: 2, teamSizeMax: 2, requiredSkills: [{ skillId, minCount: 1 }] };
  await request('/api/events', { ...eventData, teamSizeMin: 3 }, 0, 400);
  const event = await request('/api/events', eventData, 0, 201);
  const team = await request('/api/teams', { name: prefix, eventId: event.id }, 0, 201);
  const recommendations = await request(`/api/teams/${team.id}/recommendations`);
  assert.ok(JSON.stringify(recommendations).includes(prefix + '-1') || JSON.stringify(recommendations).includes(prefix));
  await request(`/api/teams/${team.id}/join`, {}, 1);
  await request(`/api/teams/${team.id}/join`, {}, 1, 409);
  await request(`/api/teams/${team.id}/join`, {}, 2, 409);
  for (const path of ['/', '/events', '/teams', '/auth', '/profile', '/create', `/events/${event.id}`, `/teams/${team.id}`]) {
    const res = await fetch(base + path, { headers: { cookie: cookies[0] } });
    assert.equal(res.status, 200, path);
  }
  await request('/api/auth', { action: 'logout' });
  await request('/api/profile', undefined, 0, 401);
  await request('/api/auth', { action: 'login', email: emails[0], password: 'Test-only-password-123' });
  console.log('PASS: registration, login/logout, profiles, validation, event/team creation, recommendations, joining, duplicate/capacity checks, and page rendering.');
} finally {
  const users = await db.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const ids = users.map(u => u.id);
  await db.team.deleteMany({ where: { createdBy: { in: ids } } });
  await db.event.deleteMany({ where: { createdBy: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
}
