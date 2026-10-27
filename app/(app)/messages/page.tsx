import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getDb, User } from '@/lib/db';
import { Avatar } from '@/components/Avatar';
import { MessageForm } from '@/components/MessageForm';

export const metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';
export default async function Messages({ searchParams }: { searchParams: { with?: string } }) {
  const me = (await getUser())!;
  const db = getDb();
  const friends = db.prepare(`SELECT u.id,u.name,u.avatar,u.university,
      (SELECT body FROM messages m WHERE (m.from_id=u.id AND m.to_id=@me) OR (m.from_id=@me AND m.to_id=u.id) ORDER BY m.id DESC LIMIT 1) last,
      (SELECT COUNT(*) FROM messages m WHERE m.from_id=u.id AND m.to_id=@me AND m.read=0) unread
    FROM connections c JOIN users u ON u.id = CASE WHEN c.from_id=@me THEN c.to_id ELSE c.from_id END
    WHERE c.status='accepted' AND (c.from_id=@me OR c.to_id=@me)
      AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id=@me UNION SELECT blocker_id FROM blocks WHERE blocked_id=@me)
    ORDER BY unread DESC, u.name`).all({ me: me.id }) as any[];
  const withId = Number(searchParams.with) || friends[0]?.id;
  const peer = friends.find((f) => f.id === withId);
  let msgs: any[] = [];
  if (peer) {
    db.prepare('UPDATE messages SET read=1 WHERE to_id=? AND from_id=?').run(me.id, peer.id);
    msgs = db.prepare('SELECT * FROM messages WHERE (from_id=@a AND to_id=@b) OR (from_id=@b AND to_id=@a) ORDER BY id LIMIT 200').all({ a: me.id, b: peer.id }) as any[];
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      {friends.length === 0 ? (
        <div className="card p-10 text-center"><MessageCircle className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-2 text-sm text-slate-500">You can message students once a connection request is accepted.</p><Link href="/community" className="btn-primary mt-4">Find students</Link></div>
      ) : (
        <div className="card grid min-h-[28rem] overflow-hidden md:grid-cols-[18rem_1fr]">
          <ul className="border-b border-slate-100 md:border-b-0 md:border-r">
            {friends.map((f) => (
              <li key={f.id}><Link href={`/messages?with=${f.id}`} className={`flex items-center gap-3 p-3.5 hover:bg-slate-50 ${f.id === peer?.id ? 'bg-teal-50/60' : ''}`}>
                <Avatar name={f.name} src={f.avatar} size={40} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{f.name}</p><p className="truncate text-xs text-slate-500">{f.last || 'Say hello'}</p></div>
                {f.unread > 0 && <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-bold text-white">{f.unread}</span>}
              </Link></li>
            ))}
          </ul>
          {peer && (
            <div className="flex min-h-[24rem] flex-col">
              <div className="flex items-center gap-3 border-b border-slate-100 p-3.5"><Avatar name={peer.name} src={peer.avatar} size={36} /><div><p className="text-sm font-bold">{peer.name}</p><p className="text-xs text-slate-500">{peer.university}</p></div></div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
                {msgs.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No messages yet. Say hello.</p>}
                {msgs.map((m) => <div key={m.id} className={`flex ${m.from_id === me.id ? 'justify-end' : ''}`}><p className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${m.from_id === me.id ? 'bg-navy-900 text-white' : 'bg-slate-100'}`}>{m.body}</p></div>)}
              </div>
              <MessageForm to={peer.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
