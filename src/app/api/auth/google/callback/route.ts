import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { currentUser, startSession } from '@/lib/auth';
import { googleAccount, googleConfig, oauthCookie, safeDestination, verifyGoogleToken } from '@/lib/google';
import { HttpError } from '@/lib/http';

export async function GET(request: Request) {
  const jar = await cookies();
  const raw = jar.get(oauthCookie)?.value;
  jar.set(oauthCookie, '', { path: '/api/auth/google', maxAge: 0 });
  let origin = new URL(request.url).origin;
  let next = '/profile';
  try {
    const config = googleConfig(); origin = config.origin;
    const query = new URL(request.url).searchParams;
    if (!raw) throw new HttpError('Your Google sign-in expired. Please try again.');
    const flow = JSON.parse(raw);
    if (typeof flow.state !== 'string' || query.get('state') !== flow.state || typeof flow.expires !== 'number' || flow.expires < Date.now() || typeof flow.verifier !== 'string' || typeof flow.nonce !== 'string') throw new HttpError('Your Google sign-in expired. Please try again.');
    next = safeDestination(flow.next);
    if (query.has('error')) throw new HttpError('Google sign-in was cancelled. You can try again or use email.');
    const code = query.get('code');
    if (!code) throw new HttpError('Google did not return a sign-in code.');
    if (flow.userId && (await currentUser())?.id !== flow.userId) throw new HttpError('Sign in again before connecting Google.');
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: 'authorization_code', code_verifier: flow.verifier }),
      cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new HttpError('Google sign-in could not be completed. Please try again.');
    const token = await response.json();
    if (typeof token.id_token !== 'string') throw new HttpError('Google did not return a valid identity.');
    const identity = await verifyGoogleToken(token.id_token, flow.nonce, config.clientId);
    const user = await googleAccount(identity, flow.userId);
    await startSession(user.id);
    return NextResponse.redirect(new URL(next, origin));
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Google sign-in could not be completed. Please try again.';
    const url = new URL('/auth', origin); url.search = new URLSearchParams({ error: message, next }).toString();
    return NextResponse.redirect(url);
  }
}
