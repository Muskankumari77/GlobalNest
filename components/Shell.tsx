'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home, BookOpen, CheckSquare, Users, Landmark, MessageCircle, User, Bell, Search, Menu, X, LogOut, Shield, Plane, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { api } from '@/lib/client';

type U = { name: string; role: string; avatar: string };
const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/guides', label: 'Explore Guides', icon: BookOpen },
  { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/services', label: 'Campus Services', icon: Landmark },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

function SidebarBody({ role, unreadMsgs, onNav }: { role: string; unreadMsgs: number; onNav?: () => void }) {
  const path = usePathname();
  const items = role !== 'student' ? [...NAV, { href: '/admin', label: 'Admin panel', icon: Shield }] : NAV;
  return (
    <div className="flex h-full flex-col bg-navy-900 px-3 py-5 text-white">
      <Link href="/dashboard" className="mb-7 px-3" onClick={onNav}><Logo /></Link>
      <nav className="flex flex-col gap-1.5" aria-label="Main">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href} onClick={onNav} aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors ${active ? 'bg-teal-500 text-white' : 'text-slate-200 hover:bg-white/10'}`}>
              <Icon className="h-5 w-5" aria-hidden />
              <span className="flex-1">{label}</span>
              {label === 'Messages' && unreadMsgs > 0 && <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-bold">{unreadMsgs}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4">
        <Plane className="mb-3 h-5 w-5 text-teal-400" aria-hidden />
        <p className="text-sm font-semibold leading-snug">Different countries.<br />Same dreams.</p>
        <p className="mt-3 text-xs text-slate-300">GlobalNest is here to support you.</p>
        <Heart className="ml-auto mt-1 h-4 w-4 text-teal-400" aria-hidden />
      </div>
    </div>
  );
}

export function Shell({ user, unread, unreadMsgs, children }: { user: U; unread: number; unreadMsgs: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ guides: any[]; services: any[] } | null>(null);
  const router = useRouter();
  const path = usePathname();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); setMenu(false); setRes(null); }, [path]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const t = setTimeout(async () => { const r = await api('/api/search?q=' + encodeURIComponent(q), 'GET'); if (r.ok) setRes(r.data); }, 200);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setRes(null); setMenu(false); } };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  async function logout() { await api('/api/auth/logout', 'POST'); router.push('/login'); router.refresh(); }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><SidebarBody role={user.role} unreadMsgs={unreadMsgs} /></aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72"><SidebarBody role={user.role} unreadMsgs={unreadMsgs} onNav={() => setOpen(false)} /></div>
          <button className="absolute right-4 top-4 rounded-full bg-white p-2" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur lg:px-8" ref={box}>
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <form className="relative max-w-xl flex-1" role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push('/guides?q=' + encodeURIComponent(q.trim())); }}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-10" placeholder="Search guides and campus services" aria-label="Search" />
            {res && (
              <div className="card absolute left-0 right-0 top-12 z-30 p-2">
                {res.guides.length + res.services.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500">No matches for “{q}”. Try “bank”, “SIM” or “library”.</p>
                ) : (
                  <>
                    {res.guides.map((g) => <Link key={'g' + g.id} href={`/guides/${g.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"><span>{g.title}</span><span className="text-xs text-slate-400">Guide</span></Link>)}
                    {res.services.map((s) => <Link key={'s' + s.id} href={`/services/${s.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"><span>{s.name}</span><span className="text-xs text-slate-400">Service</span></Link>)}
                  </>
                )}
              </div>
            )}
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/notifications" className="relative rounded-full p-2.5 hover:bg-slate-100" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <div className="relative">
              <button onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} aria-label="Profile menu"><Avatar name={user.name} src={user.avatar} size={38} /></button>
              {menu && (
                <div className="card absolute right-0 top-12 z-30 w-52 p-1.5" role="menu">
                  <p className="px-3 py-2 text-sm font-semibold">{user.name}<span className="block text-xs font-normal capitalize text-slate-500">{user.role}</span></p>
                  <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">Account settings</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem"><LogOut className="h-4 w-4" />Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
