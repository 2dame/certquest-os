'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';

const NAV = [
  { href: '/dashboard', label: 'Today' },
  { href: '/certs', label: 'Cert Paths' },
  { href: '/practice', label: 'Practice' },
  { href: '/progress', label: 'Progress' },
  { href: '/proof', label: 'Proof' },
  { href: '/glossary', label: 'Reference' },
  { href: '/settings', label: 'Settings' },
];

const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

function PomodoroTimer() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_SECS);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(mode === 'work' ? WORK_SECS : BREAK_SECS);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'work') {
              setSessions((s) => s + 1);
              setMode('break');
              setTimeLeft(BREAK_SECS);
            } else {
              setMode('work');
              setTimeLeft(WORK_SECS);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const progress = mode === 'work'
    ? 1 - timeLeft / WORK_SECS
    : 1 - timeLeft / BREAK_SECS;
  const isBreak = mode === 'break';

  return (
    <div className="border border-border bg-bgCard p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className={`text-[10px] tracking-[0.25em] uppercase font-semibold ${isBreak ? 'text-green-400' : 'text-gold'}`}>
          {isBreak ? 'BREAK' : 'FOCUS'}{sessions > 0 ? ` · ${sessions}×` : ''}
        </p>
        <p className="font-mono text-text text-sm font-bold tabular-nums">{mm}:{ss}</p>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className={`h-full transition-all ${isBreak ? 'bg-green-400' : 'bg-gold'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`flex-1 text-[10px] font-bold tracking-widest py-1.5 transition-colors ${
            running
              ? 'border border-border text-textMuted hover:text-text'
              : `border ${isBreak ? 'border-green-700 text-green-400 hover:bg-green-950/30' : 'border-gold/50 text-gold hover:bg-gold/10'}`
          }`}
        >
          {running ? 'PAUSE' : 'START'}
        </button>
        <button
          onClick={reset}
          className="px-2 text-[10px] text-textDim border border-border hover:text-textMuted transition-colors"
        >
          ↺
        </button>
      </div>
    </div>
  );
}

function StreakGuard() {
  const streak = useStore((s) => s.streak);
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastStudy = streak.lastStudyDate?.slice(0, 10);
    if (lastStudy === today || streak.current === 0) {
      setHoursLeft(null);
      return;
    }
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
    setHoursLeft(diff);
  }, [streak]);

  if (hoursLeft === null) return null;

  return (
    <div className={`border px-3 py-2 text-[10px] leading-snug ${
      hoursLeft <= 2
        ? 'border-red-800 bg-red-950/30 text-red-400'
        : 'border-yellow-800/60 bg-yellow-950/20 text-yellow-500'
    }`}>
      <p className="font-bold tracking-wider uppercase mb-0.5">
        {hoursLeft <= 2 ? '⚠ Streak at risk' : '⏱ Keep your streak'}
      </p>
      <p className="text-textMuted">
        {streak.current}d streak · {hoursLeft}h left today
      </p>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-border bg-bgElevated flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border shrink-0">
          <p className="text-gold text-[10px] tracking-[0.35em] font-semibold">CERTQUEST OS</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3">
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

        {/* Bottom tools */}
        <div className="mt-auto px-3 pb-4 space-y-3 shrink-0">
          <StreakGuard />
          <PomodoroTimer />
          <p className="text-textDim text-[10px] px-1 leading-relaxed">Local-first · data in browser</p>
        </div>
      </aside>

      <main className="p-10 max-w-5xl overflow-y-auto">{children}</main>
    </div>
  );
}
