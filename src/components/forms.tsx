'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkillEditor, WorkLinksEditor, RoundsEditor, type SelectedSkill, type WorkLink, type Round } from './profile-fields';
type Skill = { id: string; name: string; category: string };
type Profile = { name: string; bio: string | null; location: string | null; timezone: string | null; eventPreference: string; email: string; contactEmail: string | null; linkedinUrl: string | null; githubUrl: string | null; links: WorkLink[]; skills: { skillId: string; skill: { name: string } }[] };

export function DataForm({ kind, skills = [], events = [], profile, eventId = '', initialRegister = false, destination = '/profile' }: { kind: 'event' | 'team' | 'profile' | 'auth'; skills?: Skill[]; events?: { id: string; name: string }[]; profile?: Profile; eventId?: string; initialRegister?: boolean; destination?: string }) {
  const router = useRouter();
  const [register, setRegister] = useState(initialRegister);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState<SelectedSkill[]>(profile?.skills.map(s => ({ name: s.skill.name, minCount: 1 })) || []);
  const [links, setLinks] = useState<WorkLink[]>(profile?.links || []);
  const [scope, setScope] = useState('global');
  const [rounds, setRounds] = useState<Round[]>([{ name: 'Main round', mode: 'online', location: '', date: '' }]);
  const feedback = useRef<HTMLDivElement>(null);
  function showError(text: string) {
    setError(text);
    requestAnimationFrame(() => feedback.current?.focus());
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(''); setMessage('');
    const f = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(f);
    if (kind === 'auth') data.action = register ? 'register' : 'login';
    if (kind === 'event') {
      if (!selected.length) { showError('Add at least one required skill below.'); return; }
      data.teamSizeMin = Number(f.get('teamSizeMin')); data.teamSizeMax = Number(f.get('teamSizeMax'));
      if (Number(data.teamSizeMin) > Number(data.teamSizeMax)) { showError('Maximum team size must be at least the minimum team size.'); return; }
      data.requiredSkills = selected; data.rounds = rounds;
    }
    if (kind === 'profile') { data.skills = selected.map(s => s.name); data.links = links; }
    setBusy(true);
    const endpoint = { event: 'events', team: 'teams', auth: 'auth', profile: 'profile' }[kind];
    try {
      const response = await fetch('/api/' + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save. Please try again.');
      if (kind === 'profile') setMessage('Profile saved. Your skills are ready for matching.');
      else router.push(kind === 'auth' ? destination : '/' + endpoint + '/' + result.id);
      router.refresh();
    } catch (err) { showError(err instanceof Error ? err.message : 'Could not connect. Please try again.'); }
    finally { setBusy(false); }
  }
  const input = (name: string, label: string, value = '', type = 'text', required = false, placeholder = '') => <div className="form-group"><label htmlFor={name}>{label}{required && <span className="required-label">Required</span>}</label><input className="form-input" id={name} name={name} type={type} defaultValue={value} required={required} maxLength={type === 'url' ? 2000 : type === 'email' ? 254 : 200} placeholder={placeholder} autoComplete={name === 'name' && (kind === 'auth' || kind === 'profile') ? 'name' : name === 'email' ? 'email' : undefined} /></div>;
  return <form onSubmit={submit} className={'card form-card ' + (kind === 'auth' ? 'auth-form' : '')} aria-busy={busy}>
    <fieldset disabled={busy} className="form-fields">
    {kind === 'auth' && <>
      <div className="auth-tabs" aria-label="Account action"><button type="button" aria-pressed={!register} onClick={() => { setRegister(false); setError(''); }}>Sign in</button><button type="button" aria-pressed={register} onClick={() => { setRegister(true); setError(''); }}>Create account</button></div>
      <h2>{register ? 'Meet your future team.' : 'Good to see you again.'}</h2><p className="muted">{register ? 'Start with an account. Add your strengths. Find where you fit.' : 'Sign in to update your skills and keep building with your team.'}</p>
      {register && input('name', 'Your name', '', 'text', true, 'What should we call you?')}
      {input('email', 'Email address', '', 'email', true, 'you@example.com')}
      <div className="form-group"><label htmlFor="password">Password<span className="required-label">Required</span></label><div className="password-field"><input className="form-input" id="password" name="password" type={showPassword ? 'text' : 'password'} required maxLength={128} minLength={register ? 10 : undefined} autoComplete={register ? 'new-password' : 'current-password'} aria-describedby="password-help" /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div><small id="password-help">{register ? 'Use at least 10 characters.' : 'Use the password you created for this account.'}</small></div>
    </>}
    {kind !== 'auth' && <div className="form-section-title"><span className="step-number">01</span><div><h2>{kind === 'profile' ? 'The person behind the skills' : kind === 'team' ? 'Give your team a beginning' : 'Set the scene'}</h2><p className="muted">{kind === 'profile' ? 'Help future teammates get to know you.' : 'A few clear details go a long way.'}</p></div></div>}
    {(kind === 'event' || kind === 'team' || kind === 'profile') && input('name', kind === 'profile' ? 'Your name' : kind === 'team' ? 'Team name' : 'Event name', profile?.name || '', 'text', true)}
    {kind === 'team' && <div className="form-group"><label htmlFor="eventId">Competition<span className="required-label">Required</span></label><select className="form-select" name="eventId" id="eventId" defaultValue={eventId} required><option value="">Choose a competition</option>{events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><p className="field-help">Your team inherits the competition’s size limits and skill requirements.</p>{!events.length && <p className="notice">No competitions yet. <Link href="/create">Create one first →</Link></p>}</div>}
    {kind === 'event' && <>
      <div className="form-group"><label htmlFor="description">What is the challenge?</label><textarea className="form-textarea" id="description" name="description" maxLength={2000} placeholder="Explain the problem, who can participate, and what teams will build." /></div>
      <div className="form-row"><div className="form-group"><label htmlFor="type">Event type</label><select className="form-select" id="type" name="type"><option value="hackathon">Hackathon</option><option value="ctf">CTF</option><option value="competition">Other competition</option></select></div><div className="form-group"><label htmlFor="scope">Who can participate?</label><select className="form-select" id="scope" name="scope" value={scope} onChange={e => setScope(e.target.value)}><option value="global">Global — open internationally</option><option value="local">Local — a region or community</option></select></div></div>
      {scope === 'local' && input('localArea', 'Local area / community', '', 'text', true, 'e.g. Gujarat, or students at your college')}
      <p className="field-help">Reach and attendance are separate. A global competition can still require travel for its final.</p>
      {input('websiteUrl', 'Official event website (optional)', '', 'url', false, 'https://…')}
      <p className="field-help">Community-submitted events are unverified. The website helps participants check the organizer’s details.</p>
      <div className="form-row"><div className="form-group"><label htmlFor="teamSizeMin">Minimum members</label><input className="form-input" id="teamSizeMin" name="teamSizeMin" type="number" min={1} max={20} defaultValue={2} required /></div><div className="form-group"><label htmlFor="teamSizeMax">Maximum members</label><input className="form-input" id="teamSizeMax" name="teamSizeMax" type="number" min={1} max={20} defaultValue={5} required /></div></div>
      <RoundsEditor value={rounds} onChange={setRounds} />
      <details className="advanced-options"><summary>Additional eligibility requirements <span>Optional</span></summary>{input('regionRestriction', 'Required region', '', 'text', false, 'e.g. India')}{input('diversityRuleText', 'Requirement to confirm with the team', '', 'text', false, 'e.g. All members must be students')}</details>
    </>}
    {kind === 'profile' && <>
      <div className="form-group"><label htmlFor="bio">About you</label><textarea className="form-textarea" id="bio" name="bio" defaultValue={profile?.bio || ''} maxLength={1000} placeholder="What do you enjoy building? What would you like to learn next?" /></div>
      <div className="form-row">{input('location', 'Location', profile?.location || '', 'text', false, 'City, country')}{input('timezone', 'Timezone', profile?.timezone || '', 'text', false, 'e.g. Asia/Kolkata')}</div>
      <div className="form-group"><label htmlFor="eventPreference">Event preference</label><select className="form-select" id="eventPreference" name="eventPreference" defaultValue={profile?.eventPreference || 'either'}><option value="either">Online, in person, or mixed rounds</option><option value="online">Fully online only</option><option value="offline">Fully in person only</option></select></div>
      <SkillEditor suggestions={skills.map(s => s.name)} value={selected} onChange={setSelected} />
      <fieldset className="skill-picker"><legend>Connect with you</legend><p className="muted">Use an email you actively check. Signed-in TechWeb members can see this address and contact you through their email app.</p>
      {input('contactEmail', 'Active contact email', profile?.contactEmail || profile?.email || '', 'email', true, 'you@example.com')}
      <p className="field-help">Your sign-in email stays separate. Updating this contact address does not change your login.</p>
      <div className="form-row">{input('linkedinUrl', 'LinkedIn (optional)', profile?.linkedinUrl || '', 'url', false, 'https://www.linkedin.com/in/…')}{input('githubUrl', 'GitHub (optional)', profile?.githubUrl || '', 'url', false, 'https://github.com/…')}</div></fieldset>
      <WorkLinksEditor value={links} onChange={setLinks} />
    </>}
    {kind === 'event' && <SkillEditor suggestions={skills.map(s => s.name)} value={selected} onChange={setSelected} counts />}
    </fieldset>
    <div ref={feedback} tabIndex={-1} className="form-feedback">{error && <p className="notice error" role="alert">{error}</p>}{message && <p className="notice" role="status">{message} <Link href="/teams">Explore teams →</Link></p>}</div>
    <div className="form-actions"><button className="btn btn-primary" disabled={busy || (kind === 'team' && !events.length)}>{busy && <span className="spinner" aria-hidden="true" />}{busy ? 'Saving…' : kind === 'auth' ? register ? 'Create my account →' : 'Sign in →' : kind === 'profile' ? 'Save profile' : kind === 'team' ? 'Create team →' : 'Publish event →'}</button>{kind !== 'auth' && <Link className="text-link" href={kind === 'profile' ? '/teams' : kind === 'team' ? '/teams' : '/events'}>Back to {kind === 'event' ? 'competitions' : 'teams'}</Link>}</div>
    {kind === 'auth' && <p className="auth-footnote">Your email is used for team contact and is visible to signed-in members. You can change your contact address in Profile.</p>}
  </form>;
}
export function ActionButton({ endpoint, label, body = {}, destination }: { endpoint: string; label: string; body?: Record<string, unknown>; destination?: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <div><button className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); if (destination) router.push(destination); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); } finally { setBusy(false); } }}>{busy ? 'Please wait…' : label}</button>{error && <p role="alert" className="notice error">{error}</p>}</div>;
}
