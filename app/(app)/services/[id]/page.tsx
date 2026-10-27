import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, MapPin, Clock, Phone, Mail, Globe, Siren } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { SaveButton } from '@/components/Buttons';

export default async function ServiceDetail({ params }: { params: { id: string } }) {
  const user = (await getUser())!;
  const db = getDb();
  const s = db.prepare('SELECT * FROM services WHERE id=?').get(Number(params.id)) as any;
  if (!s) notFound();
  const saved = !!db.prepare('SELECT 1 FROM saved_services WHERE user_id=? AND service_id=?').get(user.id, s.id);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/services" className="inline-flex items-center text-sm font-semibold text-teal-700"><ChevronLeft className="h-4 w-4" />All services</Link>
      <div className="card space-y-4 p-6">
        <div className="flex items-start justify-between gap-3"><div><span className={`chip ${s.emergency ? 'bg-red-50 text-red-700' : 'bg-lav-50 text-lav-600'}`}>{s.emergency ? 'Emergency & after-hours' : s.category}</span><h1 className="mt-2 text-2xl font-bold">{s.name}</h1></div><SaveButton url={`/api/services/${s.id}/save`} saved={saved} /></div>
        <p className="text-slate-600">{s.description}</p>
        {s.emergency ? <div className="flex gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-900"><Siren className="h-5 w-5 shrink-0" />For life-threatening emergencies call your country&apos;s official emergency number.</div> : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><MapPin className="h-4 w-4 text-slate-400" /><div><dt className="text-xs text-slate-500">Location</dt><dd>{s.location}</dd></div></div>
          <div className="flex gap-2"><Clock className="h-4 w-4 text-slate-400" /><div><dt className="text-xs text-slate-500">Opening hours</dt><dd>{s.hours}</dd></div></div>
        </dl>
        <div className="flex flex-wrap gap-3">
          {s.phone && <a className="btn-navy" href={`tel:${s.phone.replace(/\s/g, '')}`}><Phone className="h-4 w-4" />Call</a>}
          {s.email && <a className="btn-ghost" href={`mailto:${s.email}`}><Mail className="h-4 w-4" />Email</a>}
          {s.website && <a className="btn-ghost" href={s.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" />Website</a>}
        </div>
        <p className="text-xs text-slate-500">Sample listing for demonstration. Contact details are placeholders.</p>
      </div>
    </div>
  );
}
