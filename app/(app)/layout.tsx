import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');
  const db = getDb();
  const unread = (db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND read=0').get(user.id) as any).c;
  const unreadMsgs = (db.prepare('SELECT COUNT(*) c FROM messages WHERE to_id=? AND read=0').get(user.id) as any).c;
  return <Shell user={{ name: user.name, role: user.role, avatar: user.avatar }} unread={unread} unreadMsgs={unreadMsgs}>{children}</Shell>;
}
