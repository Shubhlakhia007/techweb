import { prisma } from '@/lib/prisma';
export async function GET() {
  return Response.json(await prisma.user.findMany({ select: { id: true, name: true, bio: true, experienceLevel: true, skills: { include: { skill: true } } }, orderBy: { name: 'asc' } }));
}
