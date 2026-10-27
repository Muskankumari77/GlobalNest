import Link from 'next/link';
import { Landmark, Clock, MapPin, Siren } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { SERVICE_CATEGORIES } from '@/lib/utils';

export const metadata = { title: 'Campus services' };
export default async function Services({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const user = (await getUser())!;
  const db = getDb();
  const q = (searchParams.q || '').trim(), cat = searchParams.category || '', saved = searchParams.saved === '1';
  const where: string[] = []; const args: any[] = [];
  if (q) { const l = `%${q.replace(/[%_]/g, '')}%`; where.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)'); args.push(l, l, l); }
  if (cat) { where.push('category=?'); args.push(cat); }
  if (saved) { where.push('id IN (SELECT service_id FROM saved_services WHERE user_id=?)'); args.push(user.id); }
  const rows = db.prepare(`SELECT * FROM services ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY emergency, name`).all(...args) as any[];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Campus services</h1><p className="text-slate-600">Find support at your university. Listings are sample data until your university adds its own.</p></div>
      <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><Siren className="h-5 w-5 shrink-0" /><p><b>In an emergency</b>, contact your country&apos;s official emergency number first. Campus services are not a replacement for emergency responders.</p></div>
      <form className="card grid gap-3 p-4 sm:grid-cols-4" role="search">
        <input name="q" defaultValue={q} className="input sm:col-span-2" placeholder="Search services" aria-label="Search services" />
        <select name="category" defaultValue={cat} className="input" aria-label="Category"><option value="">All categories</option>{SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn-primary">Search</button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="saved" value="1" defaultChecked={saved} />Saved only</label>
      </form>
      {rows.length === 0 ? <div className="card p-10 text-center text-sm text-slate-500">No services found. Try a different search.</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((s) => (
            <Link key={s.id} href={`/services/${s.id}`} className={`card p-5 hover:shadow-lg ${s.emergency ? 'border-red-200' : ''}`}>
              <div className="flex items-start gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.emergency ? 'bg-red-50 text-red-600' : 'bg-lav-50 text-lav-600'}`}>{s.emergency ? <Siren className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}</span>
                <div><h2 className="font-bold">{s.name}</h2><p className="text-xs text-slate-500">{s.category}</p></div></div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{s.description}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{s.location}<Clock className="ml-3 h-3.5 w-3.5" />{s.hours}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
