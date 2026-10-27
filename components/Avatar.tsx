import { initials } from '@/lib/utils';
export function Avatar({ name, src, size = 40, square = false }: { name: string; src?: string; size?: number; square?: boolean }) {
  const r = square ? 'rounded-xl' : 'rounded-full';
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} loading="lazy" className={`${r} object-cover`} style={{ width: size, height: size }} />
  ) : (
    <span className={`${r} inline-flex items-center justify-center bg-gradient-to-br from-teal-500 to-navy-700 font-semibold text-white`} style={{ width: size, height: size, fontSize: size / 2.6 }} aria-label={name}>
      {initials(name)}
    </span>
  );
}
