import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from './prisma';
import { emailAddress } from './profile';
import { HttpError } from './http';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export const oauthCookie = 'techweb_google_flow';
export const randomToken = () => randomBytes(32).toString('base64url');
export const pkceChallenge = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');
export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_URL);
export function safeDestination(value: string | null | undefined) {
  return value && /^\/(create|teams|events|profile|people)(\/|\?|$)/.test(value) && !/[\\\r\n]/.test(value) ? value : '/profile';
}
export function googleConfig() {
  if (!googleConfigured()) throw new HttpError('Google sign-in is not configured yet.', 503);
  const origin = new URL(process.env.APP_URL!);
  if (origin.protocol !== 'https:' && !(origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname))) throw new HttpError('Invalid app URL.', 503);
  return { origin: origin.origin, clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, redirectUri: origin.origin + '/api/auth/google/callback' };
}
export async function verifyGoogleToken(token: string, nonce: string, clientId: string, verifier: JWTVerifyGetKey = keys) {
  const { payload } = await jwtVerify(token, verifier, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: clientId, algorithms: ['RS256'],
    requiredClaims: ['sub', 'exp', 'iat', 'nonce', 'email'], maxTokenAge: '10m',
  });
  if (payload.nonce !== nonce || payload.email_verified !== true || !payload.sub || (payload.azp && payload.azp !== clientId)) throw new HttpError('Google could not verify this sign-in.', 401);
  return { sub: payload.sub, email: emailAddress(payload.email), name: typeof payload.name === 'string' ? payload.name.slice(0, 80) : 'New builder' };
}

export async function googleAccount(identity: { sub: string; email: string; name: string }, linkingUserId?: string) {
  return prisma.$transaction(async tx => {
    const linked = await tx.user.findUnique({ where: { googleId: identity.sub } });
    if (linkingUserId) {
      const current = await tx.user.findUniqueOrThrow({ where: { id: linkingUserId } });
      if ((linked && linked.id !== current.id) || (current.googleId && current.googleId !== identity.sub)) throw new HttpError('This Google account is already connected to a different profile.', 409);
      if (current.email.toLowerCase() !== identity.email) throw new HttpError('Connect the Google account with the same email as your TechWeb login.', 409);
      return tx.user.update({ where: { id: current.id }, data: { googleId: identity.sub, emailVerified: true, contactEmail: current.contactEmail || identity.email } });
    }
    if (linked) return linked;
    // A matching email alone never grants access to an existing password account.
    if (await tx.user.findUnique({ where: { email: identity.email } })) throw new HttpError('Sign in with your password first, then connect Google from your profile.', 409);
    return tx.user.create({ data: { name: identity.name, email: identity.email, googleId: identity.sub, emailVerified: true, contactEmail: identity.email } });
  });
}
