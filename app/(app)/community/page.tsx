import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb, User, matchScore, csv } from '@/lib/db';
import { Avatar } from '@/components/Avatar';
import { ConnectButton, RequestActions, SafetyMenu } from '@/components/CommunityActions';

export const metadata = { title: 'Community' };
export default async function Community({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const me = (await getUser())!;
  const db = getDb();
  const country = searchParams.country || '', uni = searchParams.university || '', q = (searchParams.q || '').toLowerCase();
  const blocked = new Set(db.prepare('SELECT blocked_id b FROM blocks WHERE blocker_id=? UNION SELECT blocker_id FROM blocks WHERE blocked_id=?').all(me.id, me.id).map((r: any) => r.b));
  const conns = db.prepare('SELECT * FROM connections WHERE from_id=? OR to_id=?').all(me.id, me.id) as any[];
  const status = (id: number) => conns.find((c) => c.from_id === id || c.to_id === id);
  let people = (db.prepare("SELECT * FROM users WHERE role='student' AND status='active' AND id!=?").all(me.id) as User[]).filter((u) => !blocked.has(u.id) && (u.visibility === 'public' || (u.visibility === 'university' && u.university === me.university) || status(u.id)?.status === 'accepted'));
  const all = people;
  people = people.filter((u) => (!country || u.home_country === country || u.dest_country === country) && (!uni || u.university === uni) && (!q || (u.name + u.interests + u.course).toLowerCase().includes(q)));
  const ranked = people.map((u) => ({ u, m: matchScore(me, u) })).sort((a, b) => b.m.score - a.m.score);
  const incoming = conns.filter((c) => c.to_id === me.id && c.status === 'pending').map((c) => ({ c, u: all.find((x) => x.id === c.from_id) })).filter((x) => x.u);
  const countries = [...new Set(all.flatMap((u) => [u.home_country, u.dest_country]).filter(Boolean))].sort();
  const unis = [...new Set(all.map((u) => u.university).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Community</h1><p className="text-slate-600">Meet students with shared interests and languages. Match scores add up shared interests, languages and university.</p></div>
      {incoming.length > 0 && (
        <section className="card p-5"><h2 className="mb-3 font-bold">Requests for you</h2><ul className="space-y-3">{incoming.map(({ c, u }) => <li key={c.id} className="flex items-center gap-3"><Avatar name={u!.name} src={u!.avatar} size={44} /><div className="flex-1"><p className="text-sm font-semibold">{u!.name}</p><p className="text-xs text-slate-500">{u!.university}</p></div><RequestActions id={c.id} kind="incoming" /></li>)}</ul></section>
      )}
      <form className="card grid gap-3 p-4 sm:grid-cols-4" role="search">
        <input name="q" defaultValue={searchParams.q} className="input" placeholder="Name or interest" aria-label="Search students" />
        <select name="country" defaultValue={country} className="input" aria-label="Country"><option value="">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        <select name="university" defaultValue={uni} className="input" aria-label="University"><option value="">All universities</option>{unis.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn-primary">Filter</button>
      </form>
      {ranked.length === 0 ? <div className="card p-10 text-center text-sm text-slate-500">No students match. Try clearing filters.</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map(({ u, m }) => {
            const c = status(u.id);
            return (
              <div key={u.id} className="card p-5">
                <div className="flex gap-4">
                  <Avatar name={u.name} src={u.avatar} size={64} square />
                  <div className="min-w-0 flex-1"><div className="flex items-start justify-between"><div><p className="font-bold">{u.name}</p><p className="text-xs text-slate-600">{u.home_country} → {u.university}</p><p className="text-xs text-slate-500">{u.course}</p></div><SafetyMenu target={u.id} /></div></div>
                </div>
                {u.bio && <p className="mt-3 text-sm text-slate-600">{u.bio}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">{csv(u.interests).map((i) => <span key={i} className={`chip ${m.si.includes(i) ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{i}</span>)}</div>
                <p className="mt-3 text-xs text-slate-500">Match {m.score}%: {m.si.length} shared interests, {m.sl.length} shared languages{m.uni ? ', same university' : ''}</p>
                <div className="mt-4">
                  {!c ? <ConnectButton to={u.id} /> : c.status === 'accepted' ? <Link className="btn-navy" href={`/messages?with=${u.id}`}><MessageCircle className="h-4 w-4" />Message</Link>
                    : c.status === 'pending' && c.from_id === me.id ? <RequestActions id={c.id} kind="outgoing" /> : c.status === 'pending' ? <span className="text-sm text-slate-500">Respond in requests above</span> : <span className="text-sm text-slate-500">Request declined</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
