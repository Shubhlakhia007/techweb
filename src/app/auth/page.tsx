import { DataForm } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { googleConfigured, safeDestination } from '@/lib/google';
import { redirect } from 'next/navigation';
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string; next?: string; error?: string }> }) {
  const query = await searchParams;
  const destination = safeDestination(query.next);
  if (await currentUser() && !query.error) redirect(destination);
  return <div className="container auth-layout"><div className="auth-intro"><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>You bring the spark.<br /><span>We help you connect.</span></h1><p>Find a challenge that excites you and people who make your ideas better.</p><ol><li><span>01</span>Tell your story and share your skills.</li><li><span>02</span>Explore competitions and team needs.</li><li><span>03</span>Find your people. Build something together.</li></ol><div className="auth-note">Beginners welcome. Curiosity required.</div></div><div><div className="google-signin card"><h2>Start with your Google account</h2><p>Your Google email becomes your contact email. You can change it in your profile; signed-in members can use it to connect.</p>{query.error && <p className="notice error" role="alert">{query.error.slice(0, 300)}</p>}{googleConfigured() ? <a className="btn btn-secondary google-button" href={'/api/auth/google?next=' + encodeURIComponent(destination)}>Sign in with Google</a> : <><button className="btn btn-secondary google-button" disabled>Sign in with Google</button><p className="field-help">Google sign-in is not available yet. Use email below.</p></>}</div><DataForm kind="auth" initialRegister={query.mode === 'register'} destination={destination} /></div></div>;
}
