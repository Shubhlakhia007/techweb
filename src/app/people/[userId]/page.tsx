import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { publicProfileSelect } from '@/lib/profile';

export default async function PersonPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const viewer = await currentUser();
  const person = await prisma.user.findUnique({ where: { id: userId }, select: publicProfileSelect });
  if (!person) notFound();
  const contact = viewer ? await prisma.user.findUnique({ where: { id: userId }, select: { contactEmail: true } }) : null;
  const links = [ ...(person.linkedinUrl ? [{ label: 'LinkedIn', url: person.linkedinUrl }] : []), ...(person.githubUrl ? [{ label: 'GitHub', url: person.githubUrl }] : []), ...person.links ];
  return <div className="container public-profile"><div className="page-header"><Link href="/teams">← Explore teams</Link><h1>{person.name}</h1><p>{person.bio || 'This builder has not added a bio yet.'}</p><p className="muted">{[person.location, person.timezone].filter(Boolean).join(' · ')}</p>{viewer?.id === userId && <Link className="text-link" href="/profile">Edit your profile →</Link>}</div>
    <div className="dashboard-grid"><section className="card"><h2>Skills & contributions</h2><p className="muted">Self-reported skills. Explore their work to learn more.</p><div className="tags">{person.skills.map(s => <span className="badge badge-blue" key={s.skillId}>{s.skill.name}</span>)}</div>{!person.skills.length && <p>No skills added yet.</p>}</section>
    <section className="card"><h2>Connect by email</h2>{!viewer ? <><p>Sign in to see this builder’s contact email.</p><Link className="btn btn-secondary" href={'/auth?next=' + encodeURIComponent('/people/' + userId)}>Sign in to connect</Link></> : contact?.contactEmail ? <><p>Introduce yourself, mention your competition, and discuss availability.</p><a className="contact-link" href={'mailto:' + contact.contactEmail}>{contact.contactEmail} ↗</a><p className="field-help">Opens your email app. This address is provided by the member.</p></> : <p className="muted">This builder has not shared a contact email yet.</p>}</section></div>
    <section className="section"><h2>Work, research & profiles</h2><div className="card-grid">{links.map((link, i) => <a className="card work-link" href={link.url} key={i} target="_blank" rel="noopener noreferrer nofollow"><h3>{link.label} ↗</h3><p>{new URL(link.url).hostname}</p></a>)}</div>{!links.length && <p className="notice">No work links shared yet.</p>}</section>
  </div>;
}
