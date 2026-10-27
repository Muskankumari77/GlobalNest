'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Check, X, Flag, Ban } from 'lucide-react';
import { api } from '@/lib/client';

export function ConnectButton({ to }: { to: number }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  return (<div><button className="btn-primary" disabled={busy} onClick={async () => { setBusy(true); const r = await api('/api/connections', 'POST', { to }); setBusy(false); if (!r.ok) setErr(r.error!); else router.refresh(); }}><UserPlus className="h-4 w-4" />Connect</button>{err && <p className="mt-1 text-xs text-red-600" role="alert">{err}</p>}</div>);
}
export function RequestActions({ id, kind }: { id: number; kind: 'incoming' | 'outgoing' }) {
  const router = useRouter();
  const act = async (action: string) => { await api(`/api/connections/${id}`, 'PATCH', { action }); router.refresh(); };
  return kind === 'incoming' ? (
    <div className="flex gap-2"><button className="btn-primary !px-3 !py-2" onClick={() => act('accept')}><Check className="h-4 w-4" />Accept</button><button className="btn-ghost !px-3 !py-2" onClick={() => act('reject')}><X className="h-4 w-4" />Decline</button></div>
  ) : (<button className="btn-ghost !px-3 !py-2" onClick={() => act('cancel')}>Cancel request</button>);
}
export function SafetyMenu({ target }: { target: number }) {
  const router = useRouter();
  async function report() { const reason = prompt('What is the problem? (min 5 characters)'); if (!reason) return; const r = await api('/api/community/report', 'POST', { target, reason }); alert(r.ok ? 'Report sent. Our team will review it.' : r.error); }
  async function block() { if (!confirm('Block this student? They will no longer be able to contact you.')) return; await api('/api/community/block', 'POST', { target }); router.refresh(); }
  return (<div className="flex gap-1"><button onClick={report} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Report this student"><Flag className="h-4 w-4" /></button><button onClick={block} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Block this student"><Ban className="h-4 w-4" /></button></div>);
}
