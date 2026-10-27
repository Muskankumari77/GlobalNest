import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { TaskBoard } from '@/components/TaskBoard';
export const metadata = { title: 'My tasks' };
export default async function Page() {
  const user = (await getUser())!;
  const tasks = getDb().prepare('SELECT id,title,category,priority,status,due_date,notes FROM tasks WHERE user_id=?').all(user.id) as any[];
  return <TaskBoard tasks={tasks} />;
}
