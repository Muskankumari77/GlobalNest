import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { NotificationList } from '@/components/NotificationList';
export const metadata = { title: 'Notifications' };
export default async function Page() {
  const user = (await getUser())!;
  const items = getDb().prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 100').all(user.id);
  return <NotificationList items={items as any[]} />;
}
