import Link from 'next/link';
import { BookOpen, BadgeCheck, Users } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { GUIDE_CATEGORIES, catTone } from '@/lib/utils';

export const metadata = { title: 'Explore guides' };
const PER = 9;
export default async function Guides({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const user = (await getUser())!;
  const db = getDb();
  const q = (searchParams.q || '').trim(), cat = searchParams.category || '', country = searchParams.country ?? user.dest_country, sort = searchParams.sort || 'new', saved = searchParams.saved === '1';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: string[] = []; const args: any[] = [];
  if (q) { where.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)'); const l = `%${q.replace(/[%_]/g, '')}%`; args.push(l, l, l); }
  if (cat) { where.push('category=?'); args.push(cat); }
  if (country) { where.push('country=?'); args.push(country); }
  if (saved) { where.push('id IN (SELECT guide_id FROM saved_guides WHERE user_id=?)'); args.push(user.id); }
  const W = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const order = sort === 'helpful' ? 'helpful DESC' : sort === 'az' ? 'title COLLATE NOCASE' : 'reviewed DESC';
  const total = (db.prepare(`SELECT COUNT(*) c FROM guides ${W}`).get(...args) as any).c;
  const rows = db.prepare(`SELECT * FROM guides ${W} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, PER, (page - 1) * PER) as any[];
  const countries = (db.prepare('SELECT DISTINCT country FROM guides ORDER BY country').all() as any[]).map((r) => r.country);
  const pages = Math.max(1, Math.ceil(total / PER));
  const link = (o: Record<string, string>) => { const p = new URLSearchParams({ ...(q && { q }), ...(cat && { category: cat }), country, sort, ...(saved && { saved: '1' }), ...o } as any); return '/guides?' + p.toString(); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Explore guides</h1><p className="text-slate-600">Step-by-step help for life in your new country. Sample content is labelled and should be checked against official sources.</p></div>
      <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <input name="q" defaultValue={q} className="input lg:col-span-2" placeholder="Search guides" aria-label="Keyword" />
        <select name="category" defaultValue={cat} className="input" aria-label="Category"><option value="">All categories</option>{GUIDE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select name="country" defaultValue={country} className="input" aria-label="Country"><option value="">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        <select name="sort" defaultValue={sort} className="input" aria-label="Sort"><option value="new">Recently reviewed</option><option value="helpful">Most helpful</option><option value="az">A to Z</option></select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="saved" value="1" defaultChecked={saved} />Saved only</label>
        <button className="btn-primary sm:col-span-2 lg:col-span-1 lg:col-start-5">Apply filters</button>
      </form>
      {rows.length === 0 ? (
        <div className="card p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold">No guides match your filters</p><p className="text-sm text-slate-500">Try a different keyword or <Link className="font-semibold text-teal-700" href="/guides?country=">view all countries</Link>.</p></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g) => (
            <Link key={g.id} href={`/guides/${g.id}`} className="card overflow-hidden transition-shadow hover:shadow-lg">
              {g.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={g.image} alt="" loading="lazy" className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-gradient-to-br from-sky-100 to-lav-100"><BookOpen className="h-10 w-10 text-navy-700/60" /></div>}
              <div className="p-4">
                <div className="flex items-center gap-2"><span className={`chip ${catTone(g.category)}`}>{g.category}</span>{g.verified ? <span className="chip bg-teal-50 text-teal-700"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Official</span> : <span className="chip bg-slate-100 text-slate-600"><Users className="mr-1 h-3.5 w-3.5" />Sample / community</span>}</div>
                <h2 className="mt-2 font-bold leading-snug">{g.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{g.description}</p>
                <p className="mt-3 text-xs text-slate-500">{g.country} · Reviewed {g.reviewed}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 && <Link className="btn-ghost" href={link({ page: String(page - 1) })}>Previous</Link>}
          <span className="text-sm text-slate-600">Page {page} of {pages}</span>
          {page < pages && <Link className="btn-ghost" href={link({ page: String(page + 1) })}>Next</Link>}
        </nav>
      )}
    </div>
  );
}
