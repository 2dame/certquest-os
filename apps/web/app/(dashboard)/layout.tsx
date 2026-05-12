'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Today' },
  { href: '/certs', label: 'Cert Paths' },
  { href: '/practice', label: 'Practice' },
  { href: '/progress', label: 'Progress' },
  { href: '/proof', label: 'Proof' },
  { href: '/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border bg-bgElevated flex flex-col h-screen sticky top-0">
        <div className="px-5 py-6 border-b border-border shrink-0">
          <p className="text-gold text-[10px] tracking-[0.35em] font-semibold">CERTQUEST OS</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={[
                  'px-3 py-2.5 text-sm transition-all duration-150 border-l-2',
                  active
                    ? 'bg-bgCard text-gold border-gold'
                    : 'text-textMuted hover:text-text hover:bg-bgCard border-transparent',
                ].join(' ')}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border shrink-0">
          <p className="text-textDim text-[10px] leading-relaxed">Local-first · data in browser</p>
        </div>
      </aside>
      <main className="p-10 max-w-5xl overflow-y-auto">{children}</main>
    </div>
  );
}
