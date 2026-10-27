'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
export function UserStatusButton({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  return <button className={status === 'active' ? 'btn-danger !px-3 !py-1.5' : 'btn-ghost !px-3 !py-1.5'} onClick={async () => { const r = await api(`/api/admin/users/${id}`, 'PATCH', { status: status === 'active' ? 'disabled' : 'active' }); if (!r.ok) alert(r.error); router.refresh(); }}>{status === 'active' ? 'Disable' : 'Enable'}</button>;
}
export function AnnouncementForm() {
  const [t, setT] = useState(''); const [b, setB] = useState(''); const [m, setM] = useState(''); const router = useRouter();
  return (<form className="card space-y-3 p-5" onSubmit={async (e) => { e.preventDefault(); const r = await api('/api/admin/announcements', 'POST', { title: t, body: b }); setM(r.ok ? 'Announcement sent to all active users.' : r.error!); if (r.ok) { setT(''); setB(''); router.refresh(); } }}>
    <h2 className="font-bold">New announcement</h2><input className="input" placeholder="Title" value={t} onChange={(e) => setT(e.target.value)} aria-label="Title" required /><textarea className="input" rows={2} placeholder="Message" value={b} onChange={(e) => setB(e.target.value)} aria-label="Message" required />
    <div className="flex items-center gap-3"><button className="btn-primary">Publish</button>{m && <span className="text-sm text-slate-600" role="status">{m}</span>}</div></form>);
}
