import { prisma } from '@/lib/prisma';
import { endSession, hashPassword, startSession, verifyPassword } from '@/lib/auth';
import { failure, HttpError, sameOrigin, text } from '@/lib/http';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await request.json();
    if (body.action === 'logout') { await endSession(); return Response.json({ ok: true }); }
    if (!['register', 'login'].includes(body.action)) throw new HttpError('Invalid action.');
    const email = text(body.email, 'Email', 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError('Enter a valid email address.');
    if (typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 128) throw new HttpError('Password must contain 10–128 characters.');
    let user = await prisma.user.findUnique({ where: { email } });
    if (body.action === 'register') {
      if (user) throw new HttpError('This email is already registered.', 409);
      user = await prisma.user.create({ data: { email, contactEmail: email, name: text(body.name, 'Name', 80), passwordHash: await hashPassword(body.password) } });
    } else if (!user?.passwordHash || !await verifyPassword(body.password, user.passwordHash)) {
      throw new HttpError('Email or password is incorrect.', 401);
    }
    await startSession(user.id);
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
