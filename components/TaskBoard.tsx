'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, List, CalendarDays, AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/client';
import { fmtDate, daysUntil, STATUS_LABEL } from '@/lib/utils';

type T = { id: number; title: string; category: string; priority: string; status: string; due_date: string; notes: string };
const CATS = ['General', 'Documents', 'Banking', 'SIM & Mobile', 'Healthcare', 'Campus', 'Housing', 'Visa'];
const blank = { title: '', category: 'General', priority: 'medium', status: 'not_started', due_date: '', notes: '' };

export function TaskBoard({ tasks }: { tasks: T[] }) {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'cal'>('list');
  const [fs, setFs] = useState(''); const [fc, setFc] = useState(''); const [sort, setSort] = useState('due');
  const [edit, setEdit] = useState<(Partial<T> & typeof blank) | null>(null);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const done = tasks.filter((t) => t.status === 'completed').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const overdue = tasks.filter((t) => t.status !== 'completed' && t.due_date && daysUntil(t.due_date) < 0);

  const list = useMemo(() => {
    const l = tasks.filter((t) => (!fs || t.status === fs) && (!fc || t.category === fc));
    const pr: any = { high: 0, medium: 1, low: 2 };
    return l.sort((a, b) => sort === 'priority' ? pr[a.priority] - pr[b.priority] : sort === 'title' ? a.title.localeCompare(b.title) : (a.due_date || '9999').localeCompare(b.due_date || '9999'));
  }, [tasks, fs, fc, sort]);
  const byDay = useMemo(() => { const m = new Map<string, T[]>(); list.forEach((t) => { const k = t.due_date || 'No date'; m.set(k, [...(m.get(k) || []), t]); }); return [...m.entries()]; }, [list]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!edit) return; setBusy(true); setErr('');
    const { id, ...data } = edit as any;
    const r = id ? await api(`/api/tasks/${id}`, 'PATCH', data) : await api('/api/tasks', 'POST', data);
    setBusy(false);
    if (!r.ok) return setErr(r.error || 'Could not save.');
    setEdit(null); router.refresh();
  }
  async function setStatus(t: T, status: string) { await api(`/api/tasks/${t.id}`, 'PATCH', { status }); router.refresh(); }
  async function remove(t: T) { if (!confirm(`Delete “${t.title}”?`)) return; await api(`/api/tasks/${t.id}`, 'DELETE'); router.refresh(); }

  const Row = ({ t }: { t: T }) => {
    const late = t.status !== 'completed' && t.due_date && daysUntil(t.due_date) < 0;
    return (
      <li className="flex flex-wrap items-center gap-3 p-4">
        <button onClick={() => setStatus(t, t.status === 'completed' ? 'not_started' : 'completed')} aria-label={t.status === 'completed' ? 'Mark as not started' : 'Mark as completed'}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${t.status === 'completed' ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 hover:border-teal-500'}`}>{t.status === 'completed' && '✓'}</button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${t.status === 'completed' ? 'text-slate-400 line-through' : ''}`}>{t.title}</p>
          <p className="text-xs text-slate-500">{t.category} · <span className={late ? 'font-semibold text-red-600' : ''}>{t.due_date ? fmtDate(t.due_date) : 'No deadline'}{late ? ' (overdue)' : ''}</span>{t.notes && ` · ${t.notes}`}</p>
        </div>
        <span className={`chip ${t.priority === 'high' ? 'bg-red-50 text-red-700' : t.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span>
        <select value={t.status} onChange={(e) => setStatus(t, e.target.value)} className="input !w-auto !py-1.5 text-xs" aria-label={`Status of ${t.title}`}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setEdit(t as any)} aria-label={`Edit ${t.title}`}><Pencil className="h-4 w-4" /></button>
        <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => remove(t)} aria-label={`Delete ${t.title}`}><Trash2 className="h-4 w-4" /></button>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">My tasks</h1><p className="text-slate-600">Track deadlines and paperwork for your move.</p></div>
        <button className="btn-primary" onClick={() => { setErr(''); setEdit({ ...blank }); }}><Plus className="h-4 w-4" />Add task</button>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between text-sm"><span className="font-semibold">Checklist progress</span><span>{done} of {tasks.length} done · {pct}%</span></div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-2.5 rounded-full bg-teal-500 transition-all" style={{ width: pct + '%' }} /></div>
        {overdue.length > 0 && <p className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{overdue.length} overdue {overdue.length === 1 ? 'task' : 'tasks'}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select className="input !w-auto" value={fs} onChange={(e) => setFs(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="input !w-auto" value={fc} onChange={(e) => setFc(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="due">Sort: deadline</option><option value="priority">Sort: priority</option><option value="title">Sort: title</option></select>
        <div className="ml-auto flex rounded-xl border border-slate-200 bg-white p-1">
          <button onClick={() => setView('list')} className={`rounded-lg px-3 py-1.5 text-sm ${view === 'list' ? 'bg-navy-900 text-white' : ''}`} aria-pressed={view === 'list'}><List className="mr-1 inline h-4 w-4" />List</button>
          <button onClick={() => setView('cal')} className={`rounded-lg px-3 py-1.5 text-sm ${view === 'cal' ? 'bg-navy-900 text-white' : ''}`} aria-pressed={view === 'cal'}><CalendarDays className="mr-1 inline h-4 w-4" />Calendar</button>
        </div>
      </div>
      {list.length === 0 ? <div className="card p-10 text-center text-sm text-slate-500">{tasks.length ? 'No tasks match these filters.' : 'No tasks yet. Add one to start your checklist.'}</div>
        : view === 'list' ? <ul className="card divide-y divide-slate-100">{list.map((t) => <Row key={t.id} t={t} />)}</ul>
        : <div className="space-y-4">{byDay.map(([day, ts]) => <section key={day}><h2 className="mb-2 text-sm font-bold text-slate-600">{day === 'No date' ? 'No deadline' : fmtDate(day)}</h2><ul className="card divide-y divide-slate-100">{ts.map((t) => <Row key={t.id} t={t} />)}</ul></section>)}</div>}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={edit.id ? 'Edit task' : 'Add task'}>
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setEdit(null)} />
          <form onSubmit={save} className="card relative w-full max-w-lg space-y-4 p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{edit.id ? 'Edit task' : 'Add task'}</h2><button type="button" onClick={() => setEdit(null)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <div><label className="label" htmlFor="tt">Title</label><input id="tt" className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} required autoFocus /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="tc">Category</label><select id="tc" className="input" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="label" htmlFor="tp">Priority</label><select id="tp" className="input" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              <div><label className="label" htmlFor="td">Deadline</label><input id="td" type="date" className="input" value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} /></div>
              <div><label className="label" htmlFor="ts">Status</label><select id="ts" className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="tn">Notes and required documents</label><textarea id="tn" className="input" rows={3} value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></div>
            {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
            <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save task'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
