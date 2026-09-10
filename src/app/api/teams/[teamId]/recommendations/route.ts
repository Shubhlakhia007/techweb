import { teamDashboard } from '@/lib/team';
import { failure } from '@/lib/http';
export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try { const data = await teamDashboard((await params).teamId); return Response.json({ coverage: data.coverage, recommendations: data.recommendations }); }
  catch (error) { return failure(error); }
}
