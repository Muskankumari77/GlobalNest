import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { fmtDate } from '@/lib/utils';
import { UserStatusButton, AnnouncementForm } from '@/components/AdminActions';
export const metadata = { title: 'Admin' };
export default async function Admin() {
  const me = (await getUser())!;
  if (!['admin', 'support'].includes(me.role)) redirect('/unauthorized');
  const db = getDb(); const n = (s: string) => (db.prepare(s).get() as any).c;
  const stats = [['Students', n("SELECT COUNT(*) c FROM users WHERE role='student'")], ['Tasks', n('SELECT COUNT(*) c FROM tasks')], ['Tasks completed', n("SELECT COUNT(*) c FROM tasks WHERE status='completed'")], ['Guides', n('SELECT COUNT(*) c FROM guides')], ['Connections', n("SELECT COUNT(*) c FROM connections WHERE status='accepted'")], ['Open reports', n("SELECT COUNT(*) c FROM reports WHERE status='open'")]];
  const reports = db.prepare('SELECT r.*, a.name reporter, b.name target FROM reports r JOIN users a ON a.id=r.reporter_id JOIN users b ON b.id=r.target_id ORDER BY r.id DESC LIMIT 20').all() as any[];
  const top = db.prepare('SELECT id,title,views,helpful,not_helpful FROM guides ORDER BY views DESC LIMIT 5').all() as any[];
  const users = me.role === 'admin' ? (db.prepare('SELECT id,name,email,role,status,created_at FROM users ORDER BY id LIMIT 100').all() as any[]) : [];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{me.role === 'admin' ? 'Admin' : 'Support'} panel</h1><p className="text-slate-600">Live numbers from the database. Private messages and passwords are never shown here.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{stats.map(([l, v]) => <div key={l as string} className="card p-4"><p className="text-2xl font-bold">{v}</p><p className="text-xs text-slate-600">{l}</p></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-3 font-bold">Reported profiles</h2>{reports.length === 0 ? <p className="text-sm text-slate-500">No reports.</p> : <ul className="space-y-3 text-sm">{reports.map((r) => <li key={r.id} className="rounded-xl bg-slate-50 p-3"><b>{r.target}</b> reported by {r.reporter} <span className="text-xs text-slate-400">({fmtDate(r.created_at)})</span><p className="text-slate-600">{r.reason}</p></li>)}</ul>}</section>
        <section className="card p-5"><h2 className="mb-3 font-bold">Most viewed guides</h2><ul className="space-y-2 text-sm">{top.map((g) => <li key={g.id} className="flex justify-between"><span>{g.title}</span><span className="text-slate-500">{g.views} views · {g.helpful}👍 {g.not_helpful}👎</span></li>)}</ul></section>
      </div>
      {me.role === 'admin' && <AnnouncementForm />}
      {me.role === 'admin' && (
        <section className="card overflow-x-auto p-5"><h2 className="mb-3 font-bold">Users</h2>
          <table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>{users.map((u) => <tr key={u.id} className="border-t border-slate-100"><td className="py-2.5 font-medium">{u.name}</td><td>{u.email}</td><td className="capitalize">{u.role}</td><td>{u.status}</td><td className="text-right">{u.id !== me.id && <UserStatusButton id={u.id} status={u.status} />}</td></tr>)}</tbody></table></section>
      )}
    </div>
  );
}
