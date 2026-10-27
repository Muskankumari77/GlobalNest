import Link from 'next/link';
import { Logo } from '@/components/Logo';
export const metadata = { title: 'About' };
const S = ({ id, t, children }: { id: string; t: string; children: React.ReactNode }) => <section id={id} className="card scroll-mt-6 p-6"><h2 className="text-lg font-bold">{t}</h2><p className="mt-2 text-sm text-slate-600">{children}</p></section>;
export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8"><Link href="/"><Logo dark /></Link><h1 className="text-3xl font-bold">About GlobalNest</h1>
      <S id="about" t="What is GlobalNest?">A student project that helps international students settle in: guides, a deadline tracker, campus services and a community.</S>
      <S id="help" t="Help">Log in, finish your profile, then explore guides and add tasks. If something looks wrong, contact support below.</S>
      <S id="privacy" t="Privacy">We store only what the app needs. We do not collect passport numbers, immigration documents or banking details.</S>
      <S id="terms" t="Terms">Guides are informational and may be sample content. They are not legal, visa or financial advice.</S>
      <S id="contact" t="Contact">support@globalnest.dev (demo address).</S>
    </div>
  );
}
