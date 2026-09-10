"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
type Skill = { id: string; name: string; category: string };
type Profile = { name: string; bio: string | null; location: string | null; timezone: string | null; eventPreference: string; experienceLevel: string | null; skills: { skillId: string; proficiency: number }[] };
export function DataForm({ kind, skills = [], events = [], profile, eventId = '' }: { kind: 'event' | 'team' | 'profile' | 'auth'; skills?: Skill[]; events?: { id: string; name: string }[]; profile?: Profile; eventId?: string }) {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    const f = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(f);
    if (kind === 'auth') data.action = register ? 'register' : 'login';
    if (kind === 'event') {
      data.teamSizeMin = Number(f.get('teamSizeMin')); data.teamSizeMax = Number(f.get('teamSizeMax'));
      data.requiredSkills = skills.filter(s => f.has('skill-' + s.id)).map(s => ({ skillId: s.id, minCount: Number(f.get('count-' + s.id)) }));
    }
    if (kind === 'profile') data.skills = skills.filter(s => f.has('skill-' + s.id)).map(s => ({ skillId: s.id, proficiency: Number(f.get('count-' + s.id)) }));
    const endpoint = { event: 'events', team: 'teams', auth: 'auth', profile: 'profile' }[kind];
    try {
      const response = await fetch('/api/' + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed.');
      if (kind === 'profile') setMessage('Profile saved. Your skills are now available for matching.');
      else { router.push(kind === 'auth' ? '/profile' : '/' + endpoint + '/' + result.id); }
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  const input = (name: string, label: string, value = '', type = 'text', required = false) => <div className="form-group"><label htmlFor={name}>{label}</label><input className="form-input" id={name} name={name} type={type} defaultValue={value} required={required} maxLength={type === 'password' ? 128 : 200} minLength={type === 'password' ? 10 : undefined} autoComplete={type === 'password' ? register ? 'new-password' : 'current-password' : undefined} /></div>;
  return <form onSubmit={submit} className="card form-card">
    {kind === 'auth' && <><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p className="muted">Build a profile and find teammates who complement your skills.</p>{register && input('name', 'Your name', '', 'text', true)}{input('email', 'Email', '', 'email', true)}{input('password', 'Password (at least 10 characters)', '', 'password', true)}</>}
    {(kind === 'event' || kind === 'team' || kind === 'profile') && input('name', kind === 'profile' ? 'Your name' : kind === 'team' ? 'Team name' : 'Event name', profile?.name || '', 'text', true)}
    {kind === 'team' && <div className="form-group"><label htmlFor="eventId">Event</label><select className="form-select" name="eventId" id="eventId" defaultValue={eventId} required><option value="">Choose an event</option>{events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>}
    {kind === 'event' && <>
      <div className="form-group"><label htmlFor="description">Description</label><textarea className="form-textarea" id="description" name="description" maxLength={2000} /></div>
      <div className="form-row"><div className="form-group"><label htmlFor="type">Event type</label><select className="form-select" id="type" name="type"><option value="hackathon">Hackathon</option><option value="ctf">CTF</option></select></div><div className="form-group"><label htmlFor="mode">Mode</label><select className="form-select" id="mode" name="mode"><option value="online">Online</option><option value="offline">Offline</option></select></div></div>
      <div className="form-row"><div className="form-group"><label htmlFor="teamSizeMin">Minimum members</label><input className="form-input" id="teamSizeMin" name="teamSizeMin" type="number" min={1} max={20} defaultValue={2} required /></div><div className="form-group"><label htmlFor="teamSizeMax">Maximum members</label><input className="form-input" id="teamSizeMax" name="teamSizeMax" type="number" min={1} max={20} defaultValue={5} required /></div></div>
      {input('location', 'Venue / city (required for offline events)')}{input('date', 'Event date', '', 'date')}{input('regionRestriction', 'Required region (optional; e.g. India)')}{input('diversityRuleText', 'Requirement for manual confirmation (optional)')}
    </>}
    {kind === 'profile' && <>
      <div className="form-group"><label htmlFor="bio">About you</label><textarea className="form-textarea" id="bio" name="bio" defaultValue={profile?.bio || ''} maxLength={1000} /></div>
      {input('location', 'Location (city, country)', profile?.location || '')}{input('timezone', 'Timezone (e.g. Asia/Kolkata)', profile?.timezone || '')}
      <div className="form-row"><div className="form-group"><label htmlFor="experienceLevel">Experience</label><select className="form-select" id="experienceLevel" name="experienceLevel" defaultValue={profile?.experienceLevel || 'beginner'}>{['beginner', 'intermediate', 'advanced'].map(v => <option key={v}>{v}</option>)}</select></div><div className="form-group"><label htmlFor="eventPreference">Event preference</label><select className="form-select" id="eventPreference" name="eventPreference" defaultValue={profile?.eventPreference || 'either'}>{['either', 'online', 'offline'].map(v => <option key={v}>{v}</option>)}</select></div></div>
    </>}
    {(kind === 'profile' || kind === 'event') && <fieldset><legend>{kind === 'profile' ? 'Your skills · proficiency from 1 to 5' : 'Required skills · number of members needed'}</legend><p className="muted">{kind === 'profile' ? '1 = learning, 3 = comfortable, 5 = highly experienced.' : 'Choose at least one skill. One teammate may cover several skills.'}</p>{skills.map(s => <div className="skill-option" key={s.id}><label><input name={'skill-' + s.id} type="checkbox" defaultChecked={profile?.skills.some(v => v.skillId === s.id)} /> {s.name} <small className="muted">{s.category}</small></label><input aria-label={s.name + (kind === 'profile' ? ' proficiency' : ' required count')} className="form-input skill-count" name={'count-' + s.id} type="number" min={1} max={kind === 'profile' ? 5 : 20} defaultValue={profile?.skills.find(v => v.skillId === s.id)?.proficiency || 1} /></div>)}</fieldset>}
    {error && <p className="notice error" role="alert">{error}</p>}{message && <p className="notice" role="status">{message}</p>}
    <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : kind === 'auth' ? register ? 'Create account' : 'Sign in' : kind === 'profile' ? 'Save profile' : 'Create ' + kind}</button>
    {kind === 'auth' && <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account?' : 'New here? Create an account'}</button>}
  </form>;
}
export function ActionButton({ endpoint, label, body = {}, destination }: { endpoint: string; label: string; body?: Record<string, unknown>; destination?: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <div><button className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); if (destination) router.push(destination); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); } finally { setBusy(false); } }}>{busy ? 'Please wait…' : label}</button>{error && <p role="alert" className="notice error">{error}</p>}</div>;
}
