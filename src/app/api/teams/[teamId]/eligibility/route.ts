import { teamDashboard } from '@/lib/team';
import { failure } from '@/lib/http';
export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try { const data = await teamDashboard((await params).teamId); return Response.json({ rules: data.eligibility, status: data.eligibility.some(r => r.status === 'fail') ? 'incomplete' : data.eligibility.some(r => r.status === 'manual') ? 'manual' : 'eligible' }); }
  catch (error) { return failure(error); }
}
