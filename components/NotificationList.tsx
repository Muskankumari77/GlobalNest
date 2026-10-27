'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { api } from '@/lib/client';
import { fmtDate } from '@/lib/utils';

export function NotificationList({ items }: { items: any[] }) {
  const router = useRouter();
  const unread = items.filter((n) => !n.read).length;
  async function mark(body: object) { await api('/api/notifications', 'PATCH', body); router.refresh(); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Notifications</h1><button className="btn-ghost" disabled={!unread} onClick={() => mark({ all: true })}>Mark all as read</button></div>
      {items.length === 0 ? <div className="card p-10 text-center"><Bell className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-2 text-sm text-slate-500">You&apos;re all caught up.</p></div> : (
        <ul className="card divide-y divide-slate-100">
          {items.map((n) => (
            <li key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? '' : 'bg-teal-50/50'}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-slate-200' : 'bg-teal-500'}`} />
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-slate-600">{n.body}</p><p className="mt-1 text-xs text-slate-400">{fmtDate(n.created_at)}</p></div>
              {n.link && <Link href={n.link} onClick={() => !n.read && api('/api/notifications', 'PATCH', { id: n.id })} className="text-sm font-semibold text-teal-700">Open</Link>}
              {!n.read && <button className="text-xs font-medium text-slate-500 hover:text-navy-900" onClick={() => mark({ id: n.id })}>Mark read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
