import Link from 'next/link';
import { ClipboardCheck, BookOpen, Users, Landmark, ChevronRight, Calendar, Sparkles, Search, Plane, Utensils, Smartphone, FileText } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb, User, matchScore, csv } from '@/lib/db';
import { fmtDate, today, daysUntil, STATUS_LABEL, catTone } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';

export const metadata = { title: 'Dashboard' };
const CHIPS = [
  { label: 'Visa & Immigration', q: 'Visa', icon: Plane }, { label: 'Banking', q: 'Banking', icon: Landmark },
  { label: 'SIM & Mobile', q: 'SIM', icon: Smartphone }, { label: 'Food & Essentials', q: 'Food', icon: Utensils }, { label: 'Campus Services', q: 'Campus', icon: FileText },
];

export default async function Dashboard() {
  const user = (await getUser())!;
  const db = getDb();
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id=? ORDER BY due_date').all(user.id) as any[];
  const done = tasks.filter((t) => t.status === 'completed').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const dueSoon = tasks.filter((t) => t.status !== 'completed' && t.due_date && daysUntil(t.due_date) <= 7).length;
  const checklist = [...tasks].sort((a, b) => (a.status === 'completed' ? 0 : 1) - (b.status === 'completed' ? 0 : 1) || a.due_date.localeCompare(b.due_date)).slice(0, 4);
  const savedCount = (db.prepare('SELECT COUNT(*) c FROM saved_guides WHERE user_id=?').get(user.id) as any).c;
  const svcCount = (db.prepare('SELECT COUNT(*) c FROM services').get() as any).c;
  const blocked = db.prepare('SELECT blocked_id b FROM blocks WHERE blocker_id=? UNION SELECT blocker_id FROM blocks WHERE blocked_id=?').all(user.id, user.id).map((r: any) => r.b);
  const others = (db.prepare("SELECT * FROM users WHERE role='student' AND status='active' AND visibility!='private' AND id!=?").all(user.id) as User[])
    .filter((o) => !blocked.includes(o.id)).map((o) => ({ o, m: matchScore(user, o) })).sort((a, b) => b.m.score - a.m.score);
  const matches = others.filter((x) => x.m.score > 0).length;
  const recs = db.prepare(`SELECT * FROM guides WHERE id NOT IN (SELECT guide_id FROM saved_guides WHERE user_id=?) ORDER BY (country=?) DESC, image!='' DESC, id LIMIT 3`).all(user.id, user.dest_country) as any[];
  const ann = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 1').get() as any;

  const stats = [
    { n: dueSoon, label: 'Tasks due soon', href: '/tasks', icon: ClipboardCheck, tone: 'bg-teal-50 text-teal-600' },
    { n: savedCount, label: 'Guides saved', href: '/guides?saved=1', icon: BookOpen, tone: 'bg-lav-50 text-lav-600' },
    { n: matches, label: 'Community matches', href: '/community', icon: Users, tone: 'bg-sky-100 text-sky-700' },
    { n: svcCount, label: 'Campus services', href: '/services', icon: Landmark, tone: 'bg-lav-50 text-lav-600' },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-white">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/01_campus_hero_banner.jpg" alt="International students walking on campus" className="h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-sky-50/60 to-transparent" />
        </div>
        <div className="relative p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-slate-600">Your new home, made easier.{user.university && <span className="hidden sm:inline"> · {user.university}{user.dest_country && `, ${user.dest_country}`}</span>}</p>
          <form action="/guides" className="mt-5 flex max-w-xl rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card" role="search">
            <Search className="ml-3 mr-2 h-5 w-5 self-center text-slate-400" aria-hidden />
            <input name="q" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="What do you need help with today?" aria-label="What do you need help with today?" />
            <button className="btn-primary !px-3.5" aria-label="Search"><Search className="h-4 w-4" /></button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHIPS.map(({ label, q, icon: Icon }) => (
              <Link key={label} href={`/guides?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-medium hover:border-teal-500">
                <Icon className="h-4 w-4 text-lav-600" aria-hidden />{label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {ann && <div className="card flex items-start gap-3 p-4 text-sm"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /><p><b>{ann.title}.</b> <span className="text-slate-600">{ann.body}</span></p></div>}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
        {stats.map(({ n, label, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon className="h-6 w-6" aria-hidden /></span>
            <span><span className="block text-3xl font-bold leading-none">{n}</span><span className="mt-1 flex items-center text-sm text-slate-600">{label}<ChevronRight className="h-4 w-4" aria-hidden /></span></span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardCheck className="h-5 w-5" aria-hidden />Your arrival checklist</h2>
              <div className="w-56"><p className="text-xs text-slate-600">{pct}% complete</p><div className="mt-1 h-2 rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-teal-500" style={{ width: pct + '%' }} /></div></div>
            </div>
            {checklist.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No tasks yet. <Link href="/tasks" className="font-semibold text-teal-700">Add your first task</Link></p> : (
              <ul className="divide-y divide-slate-100">
                {checklist.map((t) => (
                  <li key={t.id}><Link href="/tasks" className="flex items-center gap-3 py-3.5 hover:bg-slate-50/60">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${t.status === 'completed' ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'}`}>{t.status === 'completed' && '✓'}</span>
                    <span className="flex-1 text-sm font-medium">{t.title}</span>
                    <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><Calendar className="h-3.5 w-3.5" aria-hidden />{fmtDate(t.due_date)}</span>
                    <span className={`chip ${t.status === 'completed' ? 'bg-teal-50 text-teal-700' : t.status === 'in_progress' ? 'bg-lav-50 text-lav-600' : 'bg-slate-100 text-slate-600'}`}>{STATUS_LABEL[t.status]}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                  </Link></li>
                ))}
              </ul>
            )}
            <Link href="/tasks" className="mt-3 inline-block text-sm font-semibold text-teal-700">View all tasks</Link>
          </section>

          <section className="card p-5">
            <div className="flex items-start justify-between">
              <div><h2 className="flex items-center gap-2 text-lg font-bold"><Users className="h-5 w-5" aria-hidden />Meet your community</h2><p className="mt-0.5 text-sm text-slate-600">Connect with fellow international students and make your new home feel smaller.</p></div>
              <Link href="/community" className="shrink-0 text-sm font-semibold text-teal-700">View all</Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {others.slice(0, 3).map(({ o }) => (
                <div key={o.id} className="rounded-2xl border border-slate-200 p-3.5">
                  <div className="flex gap-3">
                    <Avatar name={o.name} src={o.avatar} size={64} square />
                    <div className="min-w-0"><p className="truncate text-sm font-bold">{o.name}</p><p className="truncate text-xs text-slate-600">{o.home_country}</p><p className="truncate text-xs text-slate-500">{o.university}</p></div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-slate-600">{o.bio || csv(o.interests).join(', ')}</p>
                  <Link href="/community" className="mt-2 inline-block text-xs font-semibold text-teal-700">View profile</Link>
                </div>
              ))}
              {others.length === 0 && <p className="col-span-3 py-4 text-center text-sm text-slate-500">No students to show yet.</p>}
            </div>
          </section>
        </div>

        <section className="card h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5" aria-hidden />Recommended for you</h2>
          <ul className="space-y-3">
            {recs.map((g) => (
              <li key={g.id}><Link href={`/guides/${g.id}`} className="flex gap-3 rounded-2xl border border-slate-200 p-2.5 hover:border-teal-500">
                {g.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={g.image} alt="" width={96} height={96} loading="lazy" className="h-24 w-24 shrink-0 rounded-xl object-cover" /> : <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-sky-100"><BookOpen className="h-7 w-7 text-sky-700" /></span>}
                <span className="min-w-0"><span className="block text-sm font-bold leading-snug">{g.title}</span><span className="mt-1 line-clamp-2 block text-xs text-slate-600">{g.description}</span><span className={`chip mt-2 ${catTone(g.category)}`}>{g.category}</span></span>
              </Link></li>
            ))}
            {recs.length === 0 && <p className="text-sm text-slate-500">You have saved every guide. Nice work.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}
