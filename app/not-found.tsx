import Link from 'next/link';
export default function NotFound() { return <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"><h1 className="text-3xl font-bold">Page not found</h1><p className="text-slate-600">The page you are looking for does not exist.</p><Link href="/" className="btn-primary">Go home</Link></main>; }
