'use client';
import { useId, useState } from 'react';

export type SelectedSkill = { name: string; minCount: number };
export type WorkLink = { label: string; url: string };
export type Round = { name: string; mode: string; location: string; date: string };

export function SkillEditor({ suggestions, value, onChange, counts = false }: { suggestions: string[]; value: SelectedSkill[]; onChange: (v: SelectedSkill[]) => void; counts?: boolean }) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  function add(raw: string) {
    const name = raw.trim().normalize('NFKC').replace(/\s+/g, ' ');
    if (!name) return;
    if (value.some(s => s.name.toLowerCase() === name.toLowerCase())) { setError('That skill is already added.'); return; }
    if (value.length >= 50) { setError('You can add up to 50 skills.'); return; }
    if (name.length > 80) { setError('Keep each skill under 80 characters.'); return; }
    onChange([...value, { name, minCount: 1 }]); setDraft(''); setError('');
  }
  const matches = draft.trim() ? suggestions.filter(s => s.toLowerCase().includes(draft.trim().toLowerCase()) && !value.some(v => v.name.toLowerCase() === s.toLowerCase())).slice(0, 6) : [];
  return <fieldset className="skill-picker"><legend>{counts ? 'Skills your teams need' : 'Your skills'}</legend>
    <p className="muted">{counts ? 'Add any skill and how many teammates should bring it. One person can cover several skills.' : 'Add what you can contribute: coding, research, writing, design, public speaking, or anything else. Share evidence through your work links below.'}</p>
    <label htmlFor={id}>Type a skill</label><div className="add-field"><input id={id} className="form-input" value={draft} maxLength={80} placeholder="e.g. Python, literature review, CAD…" onChange={e => { setDraft(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(draft); } }} /><button className="btn btn-secondary" type="button" onClick={() => add(draft)} disabled={!draft.trim()}>Add skill</button></div>
    {!!matches.length && <div className="skill-suggestions" aria-label="Skill suggestions">{matches.map(name => <button className="badge badge-neutral" type="button" key={name} onClick={() => add(name)}>+ {name}</button>)}</div>}
    <div className="selected-skills">{value.map((s, i) => <div className="selected-skill" key={s.name}><span>{s.name}</span>{counts && <label>Members<input className="form-input skill-count" aria-label={s.name + ' required members'} type="number" required min={1} max={20} value={s.minCount} onChange={e => onChange(value.map((item, index) => index === i ? { ...item, minCount: Number(e.target.value) } : item))} /></label>}<button className="remove-item" type="button" aria-label={'Remove ' + s.name} onClick={() => onChange(value.filter((_, index) => index !== i))}>×</button></div>)}</div>
    <p className="field-help">{value.length}/50 skills added. {counts ? '' : 'Skills are self-reported.'} {draft.trim() && 'Press Add skill to include the text above before saving.'}</p>{error && <p className="notice error" role="alert">{error}</p>}
  </fieldset>;
}

export function WorkLinksEditor({ value, onChange }: { value: WorkLink[]; onChange: (v: WorkLink[]) => void }) {
  const id = useId();
  return <fieldset className="skill-picker"><legend>Work & research</legend><p className="muted">Show what you have made or published. Link a portfolio, paper, project demo, Google Scholar profile, or another website.</p>
    {value.map((link, i) => <div className="repeat-card" key={i}><div className="section-header"><h3>Link {i + 1}</h3><button type="button" className="inline-button" onClick={() => onChange(value.filter((_, index) => index !== i))} aria-label={'Remove work link ' + (i + 1)}>Remove</button></div><div className="form-row"><div className="form-group"><label htmlFor={id + '-label-' + i}>Title</label><input className="form-input" id={id + '-label-' + i} value={link.label} required maxLength={80} placeholder="e.g. My published research" onChange={e => onChange(value.map((v, index) => index === i ? { ...v, label: e.target.value } : v))} /></div><div className="form-group"><label htmlFor={id + '-url-' + i}>Website URL</label><input className="form-input" id={id + '-url-' + i} type="url" required maxLength={2000} placeholder="https://…" value={link.url} onChange={e => onChange(value.map((v, index) => index === i ? { ...v, url: e.target.value } : v))} /></div></div></div>)}
    <button className="btn btn-secondary" type="button" disabled={value.length >= 10} onClick={() => onChange([...value, { label: '', url: '' }])}>+ Add work or research link</button>
  </fieldset>;
}

export function RoundsEditor({ value, onChange }: { value: Round[]; onChange: (v: Round[]) => void }) {
  const id = useId();
  const mixed = new Set(value.map(r => r.mode)).size > 1;
  function update(i: number, key: keyof Round, text: string) { onChange(value.map((r, index) => index === i ? { ...r, [key]: text } : r)); }
  return <fieldset className="skill-picker"><legend>Rounds & attendance</legend><p className="muted">List rounds in order. For example, an online qualifying round followed by an in-person final.</p><p className="notice">{mixed ? 'Online + in person: participants must attend the listed in-person rounds.' : value[0]?.mode === 'offline' ? 'In-person attendance is required.' : 'Fully online: no in-person attendance is required.'}</p>
    {value.map((round, i) => <div className="repeat-card" key={i}><div className="section-header"><h3>Round {i + 1}</h3>{value.length > 1 && <button className="inline-button" type="button" onClick={() => onChange(value.filter((_, index) => index !== i))} aria-label={'Remove round ' + (i + 1)}>Remove</button>}</div><div className="form-row"><div className="form-group"><label htmlFor={id + '-name-' + i}>Round name</label><input className="form-input" id={id + '-name-' + i} value={round.name} required maxLength={100} placeholder={i === 0 ? 'e.g. Qualifying round' : 'e.g. Final'} onChange={e => update(i, 'name', e.target.value)} /></div><div className="form-group"><label htmlFor={id + '-mode-' + i}>Attendance</label><select className="form-select" id={id + '-mode-' + i} value={round.mode} onChange={e => update(i, 'mode', e.target.value)}><option value="online">Online</option><option value="offline">In person required</option></select></div></div><div className="form-row"><div className="form-group"><label htmlFor={id + '-date-' + i}>Date (optional)</label><input className="form-input" id={id + '-date-' + i} type="date" value={round.date} onChange={e => update(i, 'date', e.target.value)} /></div>{round.mode === 'offline' && <div className="form-group"><label htmlFor={id + '-location-' + i}>Venue / city<span className="required-label">Required</span></label><input className="form-input" id={id + '-location-' + i} value={round.location} required maxLength={200} placeholder="e.g. IIT Delhi, New Delhi, India" onChange={e => update(i, 'location', e.target.value)} /></div>}</div></div>)}
    <button className="btn btn-secondary" type="button" disabled={value.length >= 12} onClick={() => onChange([...value, { name: '', mode: 'online', date: '', location: '' }])}>+ Add another round</button>
  </fieldset>;
}
