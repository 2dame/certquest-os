'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { certPacks, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';
import type { Acronym } from '@certquest/types';

type Phase = 'intro' | 'drill' | 'done';

const XP_PER_ACRONYM = 5;

/** Shuffle a copy of an array in-place using Fisher-Yates. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export default function AcronymDrillPage() {
  const { certId } = useParams<{ certId: string }>();
  const router = useRouter();
  const addXp = useStore((s) => s.addXp);

  const pack = certPacks[certId ?? ''];
  const lore = getCertLore(certId ?? '');

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('intro');
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState<Acronym[]>([]);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [missedIds, setMissedIds] = useState<Set<string>>(new Set());
  // Track which acronyms were already awarded XP (first-correct-pass only)
  const [awardedIds, setAwardedIds] = useState<Set<string>>(new Set());

  const total = pack?.acronyms.length ?? 0;
  const knownCount = knownIds.size;
  const remaining = deck.length;
  const current: Acronym | undefined = deck[0];

  // ── Initialise deck ────────────────────────────────────────────────────────
  function startDrill(acronyms: Acronym[]) {
    setDeck(shuffle(acronyms));
    setFlipped(false);
    setKnownIds(new Set());
    setMissedIds(new Set());
    setAwardedIds(new Set());
    setPhase('drill');
  }

  function handleFlip() {
    setFlipped(true);
  }

  const handleKnew = useCallback(() => {
    if (!current || !flipped) return;
    const id = current.acronym;
    setKnownIds((prev) => new Set([...prev, id]));

    // Award XP only on first correct pass
    if (!awardedIds.has(id)) {
      addXp(XP_PER_ACRONYM, certId ?? undefined);
      setAwardedIds((prev) => new Set([...prev, id]));
    }

    setDeck((prev) => prev.slice(1));
    setFlipped(false);

    // If deck is now empty, go to done
    if (deck.length <= 1) setPhase('done');
  }, [current, flipped, deck.length, awardedIds, addXp, certId]);

  const handleMissed = useCallback(() => {
    if (!current || !flipped) return;
    const id = current.acronym;
    setMissedIds((prev) => new Set([...prev, id]));
    // Send to end of queue
    setDeck((prev) => [...prev.slice(1), prev[0]!]);
    setFlipped(false);
  }, [current, flipped]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'drill') return;
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'space') {
        e.preventDefault();
        if (!flipped) handleFlip();
        return;
      }
      if (!flipped) return;
      if (key === 'k') handleKnew();
      if (key === 'm') handleMissed();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, flipped, handleKnew, handleMissed]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!pack || !lore) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">Cert not found.</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">No acronyms available for this cert yet.</p>
      </div>
    );
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">{lore.worldName}</p>
          <h1 className="font-serif text-4xl">{pack.meta.examCode} — Acronym Drill</h1>
          <p className="text-textMuted text-sm mt-2">{total} acronyms to master</p>
        </div>

        <div className="border border-border bg-bgCard p-5 space-y-2">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-3">How it works</p>
          <p className="text-text text-sm">· Each card shows the acronym. Recall the expansion before flipping.</p>
          <p className="text-text text-sm">· "Knew it" removes the card from the deck</p>
          <p className="text-text text-sm">· "Missed it" sends it to the end of the queue</p>
          <p className="text-text text-sm">· +{XP_PER_ACRONYM} XP per acronym on first correct pass</p>
        </div>

        <div className="border border-border bg-bgCard p-4 text-xs text-textMuted space-y-1">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-2">Keyboard shortcuts</p>
          <p><kbd className="font-mono border border-border px-1">Space</kbd> — flip card</p>
          <p><kbd className="font-mono border border-border px-1">K</kbd> — Knew it &nbsp; <kbd className="font-mono border border-border px-1">M</kbd> — Missed it</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startDrill(pack.acronyms)}
            className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity"
          >
            START DRILL
          </button>
          <button
            onClick={() => router.back()}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const missed = [...missedIds];
    const missedAcronyms = pack.acronyms.filter((a) => missed.includes(a.acronym));

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Drill Complete</p>
          <h1 className="font-serif text-4xl">
            {knownCount}/{total} known on first pass
          </h1>
          <p className="text-textMuted text-sm mt-1">
            {knownCount * XP_PER_ACRONYM} XP earned
          </p>
        </div>

        <div className="border border-border bg-bgCard p-5">
          <div className="h-2 bg-bg overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-700"
              style={{ width: `${total > 0 ? (knownCount / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-textMuted mt-2">
            <span>{knownCount} known</span>
            <span>{missedIds.size} missed</span>
          </div>
        </div>

        <div className="flex gap-3">
          {missedAcronyms.length > 0 && (
            <button
              onClick={() => startDrill(missedAcronyms)}
              className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity"
            >
              DRILL MISSED ({missedAcronyms.length})
            </button>
          )}
          <button
            onClick={() => startDrill(pack.acronyms)}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-gold transition-colors"
          >
            Restart All
          </button>
          <button
            onClick={() => router.back()}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── DRILL ──────────────────────────────────────────────────────────────────
  if (!current) return null;

  const progressPct = total > 0 ? (knownCount / total) * 100 : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Gold progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto w-full py-8 px-4 flex flex-col gap-6">
        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-textMuted">
          <span>{knownCount} / {total} known · {remaining} remaining</span>
          <span className="text-textDim">{pack.meta.examCode}</span>
        </div>

        {/* Card */}
        <div
          className="border border-border bg-bgCard min-h-64 flex flex-col items-center justify-center p-8 gap-6 cursor-pointer select-none"
          onClick={!flipped ? handleFlip : undefined}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' && !flipped) handleFlip(); }}
          aria-label={flipped ? 'Card flipped' : 'Click or press Space to flip'}
        >
          {!flipped ? (
            // Front: large mono acronym
            <div className="text-center">
              <p className="font-mono text-5xl text-gold tracking-widest">{current.acronym}</p>
              <p className="text-textDim text-xs mt-6 tracking-widest uppercase">
                Press <kbd className="font-mono border border-border px-1 py-0.5">Space</kbd> or click to flip
              </p>
            </div>
          ) : (
            // Back: expansion + meaning
            <div className="text-center space-y-3">
              <p className="text-gold text-[10px] tracking-[0.3em] uppercase">{current.acronym}</p>
              <p className="text-xl text-text font-semibold leading-snug">{current.expansion}</p>
              <p className="text-sm text-textMuted leading-relaxed max-w-sm">{current.meaning}</p>
            </div>
          )}
        </div>

        {/* Action buttons — only visible after flip */}
        <div className={`flex gap-3 transition-opacity duration-200 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={handleKnew}
            disabled={!flipped}
            className="flex-1 border border-green-700 bg-green-950/30 text-green-400 font-bold tracking-widest text-sm py-3 hover:bg-green-950/60 transition-colors"
          >
            KNEW IT <span className="font-mono text-xs opacity-60 ml-1">[K]</span>
          </button>
          <button
            onClick={handleMissed}
            disabled={!flipped}
            className="flex-1 border border-red-800 bg-red-950/20 text-red-400 font-bold tracking-widest text-sm py-3 hover:bg-red-950/40 transition-colors"
          >
            MISSED IT <span className="font-mono text-xs opacity-60 ml-1">[M]</span>
          </button>
        </div>

        {/* Flip button (before flip) */}
        {!flipped && (
          <button
            onClick={handleFlip}
            className="w-full border border-border text-textMuted text-sm py-3 hover:border-gold hover:text-gold transition-colors"
          >
            Flip <span className="font-mono text-xs opacity-50 ml-1">[Space]</span>
          </button>
        )}
      </div>
    </div>
  );
}
