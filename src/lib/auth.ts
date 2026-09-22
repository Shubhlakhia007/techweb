import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { HttpError } from './http';
import { cache } from 'react';
const scrypt = promisify(scryptCallback);
const cookieName = 'techweb_session';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const key = await scrypt(password, salt, 64) as Buffer;
  const saved = Buffer.from(expected, 'hex');
  return key.length === saved.length && timingSafeEqual(key, saved);
}
export const currentUser = cache(async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: true } });
  return session && session.expiresAt > new Date() ? session.user : null;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError('Sign in to continue.', 401);
  return user;
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(cookieName);
}
export async function startSession(userId: string) {
  await endSession();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await prisma.session.create({ data: { tokenHash: digest(token), userId, expiresAt } });
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: expiresAt });
}
