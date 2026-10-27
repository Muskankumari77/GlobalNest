'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

export function ProfileForm({ u }: { u: any }) {
  const [f, setF] = useState({ name: u.name, home_country: u.home_country, dest_country: u.dest_country, university: u.university, course: u.course, level: u.level, arrival_date: u.arrival_date, bio: u.bio, interests: u.interests, languages: u.languages, visibility: u.visibility });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false); const router = useRouter();
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); const r = await api('/api/profile', 'PATCH', f); setBusy(false);
    setMsg(r.ok ? { ok: true, t: 'Profile saved.' } : { ok: false, t: r.error! }); if (r.ok) router.refresh();
  }
  const Field = ({ k, label, type = 'text', hint }: { k: keyof typeof f; label: string; type?: string; hint?: string }) => (<div><label className="label" htmlFor={k}>{label}</label><input id={k} type={type} className="input" value={f[k]} onChange={set(k)} />{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>);
  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2"><Field k="name" label="Full name" /><Field k="home_country" label="Home country" /><Field k="dest_country" label="Destination country" /><Field k="university" label="University" /><Field k="course" label="Course or department" /><Field k="level" label="Study level" /><Field k="arrival_date" label="Arrival date" type="date" /></div>
      <div><label className="label" htmlFor="bio">About you</label><textarea id="bio" rows={3} className="input" value={f.bio} onChange={set('bio')} maxLength={400} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field k="interests" label="Interests" hint="Separate with commas, e.g. Football, Cooking" /><Field k="languages" label="Languages" hint="Separate with commas" /></div>
      <div><label className="label" htmlFor="vis">Profile visibility</label><select id="vis" className="input sm:max-w-xs" value={f.visibility} onChange={set('visibility')}><option value="public">All students</option><option value="university">Only my university</option><option value="private">Hidden from discovery</option></select></div>
      {msg && <p className={`text-sm ${msg.ok ? 'text-teal-700' : 'text-red-600'}`} role="status">{msg.t}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
