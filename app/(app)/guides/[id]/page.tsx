import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, FileText, Wallet, ExternalLink, AlertTriangle, ChevronLeft } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { catTone } from '@/lib/utils';
import { SaveButton, Feedback } from '@/components/Buttons';

export default async function GuideDetail({ params }: { params: { id: string } }) {
  const user = (await getUser())!;
  const db = getDb();
  const g = db.prepare('SELECT * FROM guides WHERE id=?').get(Number(params.id)) as any;
  if (!g) notFound();
  db.prepare('UPDATE guides SET views=views+1 WHERE id=?').run(g.id);
  const saved = !!db.prepare('SELECT 1 FROM saved_guides WHERE user_id=? AND guide_id=?').get(user.id, g.id);
  const related = db.prepare('SELECT id,title,category FROM guides WHERE id!=? AND (category=? OR country=?) ORDER BY (category=?) DESC LIMIT 3').all(g.id, g.category, g.country, g.category) as any[];
  const steps: string[] = JSON.parse(g.steps), docs: string[] = JSON.parse(g.documents);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/guides" className="inline-flex items-center text-sm font-semibold text-teal-700"><ChevronLeft className="h-4 w-4" />All guides</Link>
      <div className="card overflow-hidden">
        {g.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={g.image} alt="" className="h-56 w-full object-cover" />}
        <div className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2"><span className={`chip ${catTone(g.category)}`}>{g.category}</span>{g.verified ? <span className="chip bg-teal-50 text-teal-700"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Verified official</span> : <span className="chip bg-amber-50 text-amber-700">Sample / community-submitted</span>}</div>
          <h1 className="text-2xl font-bold">{g.title}</h1>
          <p className="text-slate-600">{g.description}</p>
          <p className="text-xs text-slate-500">Applies to: {g.country} · Last reviewed {g.reviewed}</p>
          <SaveButton url={`/api/guides/${g.id}/save`} saved={saved} label="Save guide" />
        </div>
      </div>
      {!g.verified && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" />This is sample information for demonstration. Always confirm details with your university or the relevant official source. GlobalNest cannot guarantee visa or legal outcomes.</div>}
      <section className="card p-6"><h2 className="mb-3 text-lg font-bold">Step by step</h2><ol className="space-y-3">{steps.map((s, i) => <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{i + 1}</span><span className="pt-0.5 text-sm">{s}</span></li>)}</ol></section>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 flex items-center gap-2 font-bold"><FileText className="h-4 w-4" />Required documents</h2>{docs.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{docs.map((d) => <li key={d}>{d}</li>)}</ul> : <p className="text-sm text-slate-500">No documents needed.</p>}</section>
        <section className="card p-5"><h2 className="mb-2 flex items-center gap-2 font-bold"><Wallet className="h-4 w-4" />Estimated cost</h2><p className="text-sm">{g.cost || 'Not specified'}</p>{g.link ? <a href={g.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">Official reference<ExternalLink className="h-3.5 w-3.5" /></a> : <p className="mt-3 text-xs text-slate-500">No official link added yet.</p>}</section>
      </div>
      <section className="card p-5"><Feedback guideId={g.id} /></section>
      {related.length > 0 && <section><h2 className="mb-3 font-bold">Related guides</h2><div className="grid gap-3 sm:grid-cols-3">{related.map((r) => <Link key={r.id} href={`/guides/${r.id}`} className="card p-4 text-sm font-semibold hover:border-teal-500">{r.title}<span className="mt-1 block text-xs font-normal text-slate-500">{r.category}</span></Link>)}</div></section>}
    </article>
  );
}
