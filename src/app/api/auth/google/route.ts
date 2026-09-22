import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { googleConfig, oauthCookie, pkceChallenge, randomToken, safeDestination } from '@/lib/google';
import { failure } from '@/lib/http';

export async function GET(request: Request) {
  try {
    const config = googleConfig();
    const state = randomToken(), nonce = randomToken(), verifier = randomToken();
    const user = await currentUser();
    const next = safeDestination(new URL(request.url).searchParams.get('next'));
    (await cookies()).set(oauthCookie, JSON.stringify({ state, nonce, verifier, next, userId: user?.id, expires: Date.now() + 600000 }), {
      httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'lax', path: '/api/auth/google', maxAge: 600,
    });
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: 'code', scope: 'openid email profile', state, nonce,
      code_challenge: pkceChallenge(verifier), code_challenge_method: 'S256', prompt: 'select_account' }).toString();
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) { return failure(error); }
}
