'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFlashcardsForCert, getCertPack } from '@certquest/content';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type Rating = 'again' | 'hard' | 'good' | 'easy';

interface SessionStats {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

const RATING_META: Record<Rating, { label: string; sub: string; key: string; colorClass: string; bgClass: string }> = {
  again: { label: 'Again',  sub: '<1m',  key: '1', colorClass: 'text-red-400',  bgClass: 'hover:bg-red-400/10 border-red-400/30' },
  hard:  { label: 'Hard',   sub: '6m',   key: '2', colorClass: 'text-textMuted', bgClass: 'hover:bg-border/40 border-border' },
  good:  { label: 'Good',   sub: '10m',  key: '3', colorClass: 'text-text',      bgClass: 'hover:bg-border/40 border-border' },
  easy:  { label: 'Easy',   sub: '4d',   key: '4', colorClass: 'text-gold',      bgClass: 'hover:bg-gold/10 border-gold/30' },
};

const RATINGS: Rating[] = ['again', 'hard', 'good', 'easy'];

export default function FlashcardReviewPage() {
  const { certId } = useParams<{ certId: string }>();
  const recordFlashcardReview = useStore((s) => s.recordFlashcardReview);
  const getDueFlashcards = useStore((s) => s.getDueFlashcards);

  const pack = getCertPack(certId ?? '');
  const allFlashcards = getFlashcardsForCert(certId ?? '');

  const [sessionKey, setSessionKey] = useState(0);

  const queue = useMemo(() => {
    const due = getDueFlashcards(certId ?? '');
    const source = due.length > 0
      ? (allFlashcards as any[]).filter((fc: any) => due.some((d) => d.flashcardId === fc.id))
      : (allFlashcards as any[]);
    return [...source].sort(() => Math.random() - 0.5).slice(0, 20) as any[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId, sessionKey]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ again: 0, hard: 0, good: 0, easy: 0 });

  // Reset state when session key changes (Review Again)
  useEffect(() => {
    setIdx(0);
    setRevealed(false);
    setDone(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [sessionKey]);

  const card = queue[idx] as any | undefined;

  const rate = useCallback((r: Rating) => {
    if (!card) return;
    recordFlashcardReview({
      flashcardId: card.id,
      certId: certId ?? '',
      objectiveId: card.objectiveId ?? '',
      rating: r,
      reviewedAt: new Date().toISOString(),
    });
    setStats((s) => ({ ...s, [r]: s[r] + 1 }));
    if (idx < queue.length - 1) {
      setIdx((i) => i + 1);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }, [card, certId, idx, queue.length, recordFlashcardReview]);

  const reveal = useCallback(() => setRevealed(true), []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!revealed) reveal();
        else if (done) {/* noop */}
      }
      if (revealed && !done) {
        if (e.key === '1') rate('again');
        if (e.key === '2') rate('hard');
        if (e.key === '3') rate('good');
        if (e.key === '4') rate('easy');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, done, reveal, rate]);

  if (!pack || allFlashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-textMuted">No flashcards found for this cert.</p>
        <Link href="/review" className="text-gold text-sm hover:underline">{'< Back to Review'}</Link>
      </div>
    );
  }

  if (done) {
    return <CompletionScreen stats={stats} total={queue.length} onReviewAgain={() => setSessionKey((k) => k + 1)} certId={certId ?? ''} />;
  }

  if (!card) return null;

  const progress = idx / queue.length;
  const cardsLeft = queue.length - idx;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Progress bar */}
      <div className="h-1 bg-border flex-shrink-0">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bgElevated flex-shrink-0">
        <Link href="/review" className="text-gold text-sm hover:underline">{'< Back'}</Link>
        <div className="text-center">
          <p className="text-xs text-textMuted tracking-[0.2em] uppercase">Flashcard Review</p>
          <p className="text-xs text-gold font-semibold mt-0.5">{(pack as any).meta?.examName ?? certId}</p>
        </div>
        <p className="text-gold font-bold tabular-nums">{idx + 1} / {queue.length}</p>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cards area */}
        <div className="flex-1 flex flex-col overflow-auto p-6 gap-4">
          {/* Front / Back layout */}
          <div className={cn('flex gap-4 flex-1', revealed ? 'flex-row' : 'flex-col items-center justify-center')}>
            {/* Front card */}
            <div className={cn(
              'border border-border bg-bgCard p-8 flex flex-col',
              revealed ? 'flex-1' : 'w-full max-w-2xl min-h-[200px]',
            )}>
              <p className="text-gold text-[10px] tracking-[0.2em] uppercase mb-3">
                {(card.kind ?? 'basic').toUpperCase()}
              </p>
              <p className="text-text text-xl leading-relaxed flex-1">{card.front}</p>
              {card.hint && !revealed && (
                <p className="text-textMuted text-xs italic mt-4 border-t border-border pt-3">{card.hint}</p>
              )}
            </div>

            {/* Back card — shown after reveal, side-by-side on desktop */}
            {revealed && (
              <div className="flex-1 border border-gold bg-bgCard p-8 flex flex-col">
                <p className="text-gold text-[10px] tracking-[0.2em] uppercase mb-3">ANSWER</p>
                <p className="text-text text-lg leading-relaxed flex-1">{card.back}</p>
                {card.explanation && (
                  <div className="border-t border-border mt-4 pt-3">
                    <p className="text-textMuted text-xs tracking-[0.15em] uppercase mb-1">Explanation</p>
                    <p className="text-textMuted text-sm leading-relaxed">{card.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex-shrink-0">
            {!revealed ? (
              <button
                onClick={reveal}
                className="w-full bg-gold text-bg font-bold tracking-[0.15em] uppercase py-4 hover:bg-gold/90 transition-colors"
              >
                Show Answer
                <span className="ml-3 text-xs font-normal opacity-60">[Space]</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {RATINGS.map((r) => {
                  const meta = RATING_META[r];
                  return (
                    <button
                      key={r}
                      onClick={() => rate(r)}
                      className={cn(
                        'border py-4 flex flex-col items-center gap-1 transition-colors',
                        meta.bgClass,
                      )}
                    >
                      <span className={cn('font-bold text-sm tracking-wide', meta.colorClass)}>
                        {meta.label}
                      </span>
                      <span className="text-textMuted text-xs">{meta.sub}</span>
                      <span className="text-textMuted text-[10px] mt-1 opacity-60">[{meta.key}]</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-56 border-l border-border bg-bgElevated flex-shrink-0 flex flex-col p-4 gap-4 overflow-auto">
          {/* Session progress */}
          <div>
            <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase mb-3">Session</p>
            <div className="space-y-2">
              <StatRow label="Cards left" value={cardsLeft} />
              <StatRow label="Reviewed" value={idx} />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Ratings breakdown */}
          <div>
            <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase mb-3">Ratings</p>
            <div className="space-y-2">
              <StatRow label="Again" value={stats.again} valueClass="text-red-400" />
              <StatRow label="Hard"  value={stats.hard}  />
              <StatRow label="Good"  value={stats.good}  />
              <StatRow label="Easy"  value={stats.easy}  valueClass="text-gold" />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Keyboard shortcuts */}
          <div>
            <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase mb-3">Shortcuts</p>
            <div className="space-y-1.5 text-xs">
              <ShortcutRow keys="Space" action={revealed ? 'Next card' : 'Show answer'} />
              {revealed && (
                <>
                  <ShortcutRow keys="1" action="Again" />
                  <ShortcutRow keys="2" action="Hard" />
                  <ShortcutRow keys="3" action="Good" />
                  <ShortcutRow keys="4" action="Easy" />
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Completion screen
// ---------------------------------------------------------------------------
interface CompletionScreenProps {
  stats: SessionStats;
  total: number;
  onReviewAgain: () => void;
  certId: string;
}

function CompletionScreen({ stats, total, onReviewAgain, certId }: CompletionScreenProps) {
  const retentionRate = total > 0
    ? Math.round(((stats.good + stats.easy) / total) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Review Complete</p>
          <h1 className="font-serif text-4xl text-text">{total} cards reviewed</h1>
          <p className="text-textMuted text-sm mt-2">
            {retentionRate}% retention rate
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Again" value={stats.again} valueClass="text-red-400" />
          <StatCard label="Hard"  value={stats.hard} />
          <StatCard label="Good"  value={stats.good} />
          <StatCard label="Easy"  value={stats.easy} valueClass="text-gold" />
        </div>

        {/* SM-2 explanation */}
        <div className="border border-border bg-bgCard p-5 text-sm text-textMuted leading-relaxed">
          Cards rated <span className="text-red-400">Again</span> will reappear sooner.
          Cards rated <span className="text-gold">Easy</span> will resurface after several days.
          Your schedule adapts based on performance.
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReviewAgain}
            className="flex-1 bg-gold text-bg font-bold tracking-[0.15em] uppercase py-4 hover:bg-gold/90 transition-colors"
          >
            Review Again
          </button>
          <Link
            href="/review"
            className="flex-1 border border-border text-text font-bold tracking-[0.1em] uppercase py-4 text-center hover:border-gold hover:text-gold transition-colors"
          >
            Back to Decks
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------
function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-textMuted text-xs">{label}</span>
      <span className={cn('font-bold tabular-nums text-sm', valueClass ?? 'text-text')}>{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="border border-border bg-bgCard p-4 flex flex-col items-center gap-1">
      <span className={cn('text-2xl font-bold tabular-nums', valueClass ?? 'text-text')}>{value}</span>
      <span className="text-textMuted text-[10px] tracking-[0.15em] uppercase">{label}</span>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-textMuted">{action}</span>
      <kbd className="border border-border bg-bgCard text-text text-[10px] px-1.5 py-0.5 font-mono">{keys}</kbd>
    </div>
  );
}
