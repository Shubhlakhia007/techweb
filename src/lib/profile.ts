import { Prisma } from '@prisma/client';
import { HttpError, text } from './http';

export function emailAddress(value: unknown) {
  const email = text(value, 'Contact email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError('Enter a valid contact email address.');
  return email;
}

export function website(value: unknown, label = 'Website') {
  const raw = text(value, label, 2000, true);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
    return url.href;
  } catch { throw new HttpError(`${label} must be a full http:// or https:// link.`); }
}

export function skillNames(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 50) throw new HttpError('Add up to 50 skills.');
  const names = value.map(v => text(v, 'Skill name', 80).normalize('NFKC').replace(/\s+/g, ' '));
  if (new Set(names.map(n => n.toLowerCase())).size !== names.length) throw new HttpError('Each skill should appear only once.');
  return names;
}

export async function resolveSkills(tx: Prisma.TransactionClient, names: string[]) {
  const existing = await tx.skill.findMany();
  const known = new Map(existing.map(s => [s.name.normalize('NFKC').toLowerCase(), s.id]));
  const ids: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    ids.push(known.get(key) ?? (await tx.skill.upsert({ where: { name: key }, create: { name: key, category: 'community' }, update: {} })).id);
  }
  return ids;
}

export const publicProfileSelect = {
  id: true, name: true, bio: true, location: true, timezone: true, eventPreference: true,
  linkedinUrl: true, githubUrl: true, links: true,
  skills: { select: { skillId: true, skill: { select: { name: true } } } },
} satisfies Prisma.UserSelect;
