import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { googleAccount, pkceChallenge, safeDestination, verifyGoogleToken } from '../src/lib/google';
import { prisma } from '../src/lib/prisma';

const prefix = `oauth-test-${Date.now()}`;
after(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } }); await prisma.$disconnect(); });

test('redirect targets stay inside supported app pages and PKCE uses SHA-256', () => {
  assert.equal(safeDestination('//evil.example'), '/profile');
  assert.equal(safeDestination('/teams\\evil.example'), '/profile');
  assert.equal(safeDestination('/create?kind=team&eventId=123'), '/create?kind=team&eventId=123');
  assert.equal(pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});

test('Google identity validation rejects forged, expired, wrong-client, unverified, and replayed tokens', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const key = await exportJWK(publicKey);
  const verifier = createLocalJWKSet({ keys: [{ ...key, kid: 'test', alg: 'RS256' }] });
  const sign = (claims = {}, audience = 'test-client', expiry = '5m') => new SignJWT({ nonce: 'one-use-nonce', email: `${prefix}@example.com`, email_verified: true, name: 'Test Builder', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).setSubject('google-subject').setIssuer('https://accounts.google.com').setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(privateKey);
  const valid = await sign();
  assert.equal((await verifyGoogleToken(valid, 'one-use-nonce', 'test-client', verifier)).sub, 'google-subject');
  await assert.rejects(verifyGoogleToken(valid, 'wrong-nonce', 'test-client', verifier));
  await assert.rejects(verifyGoogleToken(await sign({}, 'wrong-client'), 'one-use-nonce', 'test-client', verifier));
  await assert.rejects(verifyGoogleToken(await sign({}, 'test-client', '-1m'), 'one-use-nonce', 'test-client', verifier));
  await assert.rejects(verifyGoogleToken(await sign({ email_verified: false }), 'one-use-nonce', 'test-client', verifier));
  await assert.rejects(verifyGoogleToken(await sign({ azp: 'other-client' }), 'one-use-nonce', 'test-client', verifier));
  const pieces = valid.split('.'); pieces[1] = Buffer.from(JSON.stringify({ sub: 'attacker' })).toString('base64url');
  await assert.rejects(verifyGoogleToken(pieces.join('.'), 'one-use-nonce', 'test-client', verifier));
});

test('Google accounts persist by subject and cannot take over a password account by matching its email', async () => {
  const email = `${prefix}-existing@example.com`;
  const existing = await prisma.user.create({ data: { email, name: 'Existing builder', passwordHash: 'test-only-unused-hash' } });
  const identity = { sub: prefix + '-google', email, name: 'Google builder' };
  await assert.rejects(googleAccount(identity), /password first/);
  assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: existing.id } })).googleId, null);
  const linked = await googleAccount(identity, existing.id);
  assert.equal(linked.contactEmail, email);
  assert.equal(linked.emailVerified, true);
  assert.equal((await googleAccount(identity)).id, existing.id);
  const fresh = await googleAccount({ ...identity, email: `${prefix}-new@example.com`, sub: prefix + '-new' });
  assert.equal(fresh.contactEmail, `${prefix}-new@example.com`);
  await assert.rejects(googleAccount(identity, fresh.id), /different profile/);
});
