import { prisma } from '@/lib/prisma';
import { publicProfileSelect } from '@/lib/profile';
export async function GET() {
  return Response.json(await prisma.user.findMany({ select: publicProfileSelect, orderBy: { name: 'asc' } }));
}
