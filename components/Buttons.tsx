'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '@/lib/client';

export function SaveButton({ url, saved, label = 'Save' }: { url: string; saved: boolean; label?: string }) {
  const [on, setOn] = useState(saved); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function toggle() {
    setBusy(true); setOn(!on);
    const r = await api(url, 'POST');
    if (!r.ok) setOn(on); else router.refresh();
    setBusy(false);
  }
  return (
    <button onClick={toggle} disabled={busy} className={on ? 'btn-primary' : 'btn-ghost'} aria-pressed={on}>
      {on ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{on ? 'Saved' : label}
    </button>
  );
}
export function Feedback({ guideId }: { guideId: number }) {
  const [v, setV] = useState<boolean | null>(null);
  async function send(h: boolean) { const r = await api(`/api/guides/${guideId}/feedback`, 'POST', { helpful: h }); if (r.ok) setV(h); }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium">Was this guide helpful?</span>
      <button onClick={() => send(true)} className={v === true ? 'btn-primary' : 'btn-ghost'}><ThumbsUp className="h-4 w-4" />Helpful</button>
      <button onClick={() => send(false)} className={v === false ? 'btn-navy' : 'btn-ghost'}><ThumbsDown className="h-4 w-4" />Not helpful</button>
      {v !== null && <span className="text-sm text-teal-700" role="status">Thanks for your feedback.</span>}
    </div>
  );
}
