import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'GlobalNest — Your new home, made easier', template: '%s · GlobalNest' },
  description: 'Guides, tasks, campus services and a community for international students.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b2545' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
