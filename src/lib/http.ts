import { Prisma } from '@prisma/client';
export class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof SyntaxError) return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return Response.json({ error: 'This record already exists.' }, { status: 409 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return Response.json({ error: 'The team changed while you were joining. Please try again.' }, { status: 409 });
  console.error(error);
  return Response.json({ error: 'Unable to complete this request.' }, { status: 500 });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new HttpError('Cross-origin request rejected.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError('JSON content required.', 415);
}
export function text(value: unknown, label: string, max = 200, optional = false): string {
  if (optional && (value === undefined || value === null || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(`${label} must contain 1–${max} characters.`);
  return value.trim();
}
export function choice(value: unknown, values: string[], label: string): string {
  if (typeof value !== 'string' || !values.includes(value)) throw new HttpError(`Choose a valid ${label}.`);
  return value;
}
export function integer(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) throw new HttpError(`${label} must be an integer from ${min} to ${max}.`);
  return value;
}
