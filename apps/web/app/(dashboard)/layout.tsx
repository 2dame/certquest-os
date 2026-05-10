import Link from 'next/link';

const NAV = [
  { href: '/dashboard', label: 'Today' },
  { href: '/certs', label: 'Cert Paths' },
  { href: '/practice', label: 'Practice' },
  { href: '/progress', label: 'Progress' },
  { href: '/proof', label: 'Proof' },
  { href: '/settings', label: 'Settings' },
  { href: '/content-dev', label: 'Content Dev' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-bgElevated p-6">
        <p className="text-gold text-xs tracking-[0.3em] mb-8">CERTQUEST OS</p>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2 hover:bg-bgCard text-text">
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="text-textMuted text-[10px] mt-12 leading-relaxed">
          Local-first. Mobile is the primary surface. The web dashboard mirrors progress for laptop study.
        </p>
      </aside>
      <main className="p-10 max-w-6xl">{children}</main>
    </div>
  );
}
