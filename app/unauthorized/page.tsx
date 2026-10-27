import Link from 'next/link';
export const metadata = { title: 'Not allowed' };
export default function Page() { return <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"><h1 className="text-3xl font-bold">You don&apos;t have access to this page</h1><p className="text-slate-600">Your account role does not allow this action.</p><Link href="/dashboard" className="btn-primary">Back to dashboard</Link></main>; }
