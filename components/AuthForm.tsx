'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/client';
import { Logo } from './Logo';

const FIELDS: [string, string, string][] = [['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['confirm', 'Confirm password', 'password'], ['home_country', 'Home country', 'text'], ['dest_country', 'Destination country', 'text'], ['university', 'University', 'text'], ['course', 'Course or department', 'text'], ['level', 'Study level', 'text'], ['arrival_date', 'Arrival date (optional)', 'date']];

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter(); const sp = useSearchParams();
  const [v, setV] = useState<Record<string, string>>({ dest_country: 'United Kingdom' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const fields = mode === 'login' ? FIELDS.slice(1, 3) : FIELDS;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (mode === 'signup' && v.password !== v.confirm) return setErr('Passwords do not match.');
    setBusy(true);
    const { confirm, ...data } = v;
    const r = await api(`/api/auth/${mode}`, 'POST', data); setBusy(false);
    if (!r.ok) return setErr(r.error!);
    const next = sp.get('next');
    router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'); router.refresh();
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-lav-50 p-4">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-4 p-7">
        <Link href="/" aria-label="GlobalNest home"><Logo dark /></Link>
        <div><h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="text-sm text-slate-600">{mode === 'login' ? 'Log in to continue.' : 'Tell us a little about your move.'}</p></div>
        <div className={mode === 'signup' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
          {fields.map(([k, l, t]) => (<div key={k} className={k === 'name' || k === 'email' ? 'sm:col-span-2' : ''}><label className="label" htmlFor={k}>{l}</label><input id={k} type={t} className="input" value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} required={!/optional|course|level/.test(l)} autoComplete={k === 'password' ? (mode === 'login' ? 'current-password' : 'new-password') : k === 'email' ? 'email' : undefined} /></div>))}
        </div>
        {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="text-center text-sm text-slate-600">{mode === 'login' ? <>New here? <Link className="font-semibold text-teal-700" href="/signup">Create an account</Link></> : <>Already have an account? <Link className="font-semibold text-teal-700" href="/login">Log in</Link></>}</p>
        {mode === 'login' && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Demo: student@globalnest.dev / Student@123 · admin@globalnest.dev / Admin@123 · support@globalnest.dev / Support@123</p>}
      </form>
    </main>
  );
}
