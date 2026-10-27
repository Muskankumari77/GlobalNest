import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, ClipboardCheck, Users, Landmark, ShieldCheck, Lock, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export default async function Landing() {
  if (await getUser()) redirect('/dashboard');
  const features = [
    { icon: BookOpen, t: 'Regional guides', d: 'Banking, SIM cards, food, visas and healthcare, explained step by step for where you are going.' },
    { icon: ClipboardCheck, t: 'Arrival checklist', d: 'Track paperwork and deadlines so nothing slips through in your first weeks.' },
    { icon: Landmark, t: 'Campus services', d: 'Find the right office, opening hours and contact in seconds.' },
    { icon: Users, t: 'Student community', d: 'Meet people who share your languages and interests, and connect safely.' },
  ];
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo dark />
        <nav className="flex items-center gap-3"><Link href="/login" className="btn-ghost">Log in</Link><Link href="/signup" className="btn-primary">Get started</Link></nav>
      </header>
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">Your new home, made easier.</h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">GlobalNest brings guides, deadlines, campus support and a student community into one calm place, so moving abroad to study feels manageable.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn-primary !px-6 !py-3">Get started</Link><Link href="/login?next=/guides" className="btn-ghost !px-6 !py-3"><Search className="h-4 w-4" />Explore guides</Link></div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/01_campus_hero_banner.jpg" alt="International students walking across a university campus" className="w-full rounded-3xl object-cover shadow-card" fetchPriority="high" />
      </section>
      <section className="bg-mist py-16"><div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold">Everything for your first months</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: I, t, d }) => <div key={t} className="card p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><I className="h-5 w-5" /></span><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[['/images/02_banking_guide.jpg', 'Banking basics'], ['/images/03_local_food_guide.jpg', 'Local food guide'], ['/images/04_sim_mobile_guide.jpg', 'SIM & mobile plans']].map(([src, t]) => (
            <div key={t} className="card overflow-hidden">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt="" loading="lazy" className="h-44 w-full object-cover" /><p className="p-4 font-bold">{t}</p></div>
          ))}
        </div>
      </div></section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {['Tell us where you are going and what you study.', 'Follow your checklist and read guides for your country.', 'Meet other students and ask campus services for help.'].map((s, i) => <li key={i} className="card flex gap-3 p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">{i + 1}</span><p className="text-sm">{s}</p></li>)}
        </ol>
      </section>
      <section className="bg-navy-900 py-14 text-white"><div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
        <div><h2 className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="h-6 w-6 text-teal-400" />Built with privacy in mind</h2><p className="mt-3 text-slate-300">We track what you need to do, not your passport or bank details. You choose who can see your profile, and you can report or block anyone.</p></div>
        <div className="flex items-start gap-3 text-slate-300"><Lock className="mt-1 h-5 w-5 shrink-0 text-teal-400" /><p className="text-sm">Passwords are hashed, sessions use secure cookies, and guides are clearly marked as official or community-submitted. GlobalNest does not guarantee visa or legal outcomes.</p></div>
      </div></section>
      <footer className="border-t border-slate-200 py-8 text-sm text-slate-600"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4"><Logo dark /><nav className="flex gap-5" aria-label="Footer"><Link href="/about">About</Link><Link href="/about#help">Help</Link><Link href="/about#privacy">Privacy</Link><Link href="/about#terms">Terms</Link><Link href="/about#contact">Contact</Link></nav></div></footer>
    </div>
  );
}
