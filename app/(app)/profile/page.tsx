import { getUser } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import { ProfileForm } from '@/components/ProfileForm';
export const metadata = { title: 'Profile' };
export default async function Page() {
  const u = (await getUser())!;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-4"><Avatar name={u.name} src={u.avatar} size={72} /><div><h1 className="text-2xl font-bold">{u.name}</h1><p className="text-sm capitalize text-slate-600">{u.email} · {u.role}</p></div></div>
      <ProfileForm u={u} />
    </div>
  );
}
