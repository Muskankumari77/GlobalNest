export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke="#2dd4bf" strokeWidth="3" />
      <ellipse cx="24" cy="24" rx="8" ry="19" stroke="#2dd4bf" strokeWidth="2.5" />
      <path d="M5 24h38M9 14h30M9 34h30" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`text-2xl font-bold tracking-tight ${dark ? 'text-navy-900' : 'text-white'}`}>GlobalNest</span>
    </span>
  );
}
