'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) { return <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"><h1 className="text-2xl font-bold">Something went wrong</h1><p className="text-slate-600">Please try again.</p><button className="btn-primary" onClick={reset}>Try again</button></main>; }
