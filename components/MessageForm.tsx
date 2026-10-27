'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { api } from '@/lib/client';
export function MessageForm({ to }: { to: number }) {
  const [text, setText] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim()) return; setBusy(true);
    const r = await api('/api/messages', 'POST', { to, body: text }); setBusy(false);
    if (!r.ok) return setErr(r.error!); setText(''); setErr(''); router.refresh();
  }
  return (<form onSubmit={send} className="border-t border-slate-100 p-3"><div className="flex gap-2"><input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" aria-label="Message" maxLength={2000} /><button className="btn-primary" disabled={busy} aria-label="Send"><Send className="h-4 w-4" /></button></div>{err && <p className="mt-1 text-xs text-red-600" role="alert">{err}</p>}</form>);
}
