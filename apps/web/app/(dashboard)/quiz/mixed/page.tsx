'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { certPacks, certDisplayOrder } from '@certquest/content';
import { useStore } from '@/lib/store';
import type { CertPack } from '@certquest/content';

type Phase = 'setup' | 'question' | 'feedback' | 'done';

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;
const QUIZ_SIZE = 15;
const XP_CORRECT = 10;
const XP_BONUS = 50;

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export default function MixedQuizPage() {
  const router = useRouter();
  const addXp = useStore((s) => s.addXp);
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const completedLessons = useStore((s) => s.completedLessons);

  // Determine which certs the user has started
  const startedCertIds = useMemo(() => {
    const started = new Set(completedLessons.map((l) => l.certId));
    return certDisplayOrder.filter((cid) => started.has(cid) && certPacks[cid]);
  }, [completedLessons]);

  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCerts.length === 0 && startedCertIds.length > 0) {
      setSelectedCerts(startedCertIds.slice(0, 3));
    }
  }, [startedCertIds]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCert(cid: string) {
    setSelectedCerts((prev) =>
      prev.includes(cid) ? prev.filter((c) => c !== cid) : [...prev, cid]
    );
  }

  // Build mixed question pool from selected certs
  const questions = useMemo(() => {
    if (selectedCerts.length === 0) return [];
    type Q = CertPack['questionBank'][number];
    const pool: { q: Q; certId: string }[] = [];
    for (const cid of selectedCerts) {
      const p = certPacks[cid];
      if (!p) continue;
      const perCert = Math.ceil(QUIZ_SIZE / selectedCerts.length);
      const picked = [...p.questionBank].sort(() => Math.random() - 0.5).slice(0, perCert);
      for (const q of picked) pool.push({ q, certId: cid });
    }
    return pool.sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);
  }, [selectedCerts]);

  const [phase, setPhase] = useState<Phase>('setup');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<{ qId: string; correct: boolean; certId: string; domainId: string; objectiveId: string; selected: string[] }[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  const entry = questions[idx];
  const q = entry?.q;
  const isMulti = q ? q.correctAnswers.length > 1 : false;
  const isCorrect = q ? sameSet(selected, q.correctAnswers) : false;

  function toggle(choiceId: string) {
    if (!q) return;
    setSelected((prev) =>
      isMulti
        ? prev.includes(choiceId) ? prev.filter((x) => x !== choiceId) : [...prev, choiceId]
        : [choiceId]
    );
  }

  const submitAnswer = useCallback(() => {
    if (!q || !entry || selected.length === 0) return;
    const correct = sameSet(selected, q.correctAnswers);
    const xpEarned = correct ? XP_CORRECT : 0;
    setResults((r) => [...r, { qId: q.id, correct, certId: entry.certId, domainId: q.domainId, objectiveId: q.objectiveId ?? '', selected }]);
    setTotalXp((x) => x + xpEarned);
    if (correct) addXp(xpEarned);
    setPhase('feedback');
  }, [q, entry, selected, addXp]);

  function advance() {
    setSelected([]);
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
      setPhase('question');
    } else {
      const correctCount = results.filter((r) => r.correct).length;
      const isPerfect = correctCount === questions.length;
      if (isPerfect) { addXp(XP_BONUS); setTotalXp((x) => x + XP_BONUS); }
      // Record per-cert attempts
      const byCert: Record<string, typeof results> = {};
      for (const r of results) {
        (byCert[r.certId] ??= []).push(r);
      }
      for (const [cid, certResults] of Object.entries(byCert)) {
        recordQuizAttempt({
          certId: cid,
          attemptedAt: new Date().toISOString(),
          questionCount: certResults.length,
          correctCount: certResults.filter((r) => r.correct).length,
          questions: certResults.map((r) => ({
            questionId: r.qId,
            isCorrect: r.correct,
            selected: r.selected,
            objectiveId: r.objectiveId,
            domainId: r.domainId,
          })),
        });
      }
      setPhase('done');
    }
  }

  useEffect(() => {
    if (phase === 'setup' || phase === 'done') return;
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if (phase === 'question' && q) {
        const ci = CHOICE_KEYS.indexOf(key as typeof CHOICE_KEYS[number]);
        if (ci !== -1 && ci < q.choices.length) { toggle(q.choices[ci]!.id); return; }
        if ((key === 'enter' || key === ' ') && selected.length > 0) { e.preventDefault(); submitAnswer(); }
      }
      if (phase === 'feedback') {
        if (key === 'enter' || key === ' ' || key === 'arrowright') { e.preventDefault(); advance(); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q, selected, idx]);

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Multi-Cert Quiz</p>
          <h1 className="font-serif text-4xl text-text">Mixed Study Session</h1>
          <p className="text-textMuted text-sm mt-2">{QUIZ_SIZE} questions drawn from your selected certs</p>
        </div>

        <div className="border border-border bg-bgCard p-5">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-4">Select Certs</p>
          <div className="space-y-2">
            {certDisplayOrder.map((cid) => {
              const p = certPacks[cid];
              if (!p) return null;
              const isSelected = selectedCerts.includes(cid);
              const hasStarted = startedCertIds.includes(cid);
              return (
                <button
                  key={cid}
                  onClick={() => toggleCert(cid)}
                  className={`w-full flex items-center gap-4 border px-4 py-3 text-left transition-colors ${
                    isSelected ? 'border-gold bg-gold/5' : 'border-border hover:border-textMuted'
                  }`}
                >
                  <div className={`w-4 h-4 border-2 shrink-0 flex items-center justify-center ${isSelected ? 'border-gold bg-gold' : 'border-border'}`}>
                    {isSelected && <span className="text-bg text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isSelected ? 'text-gold' : 'text-text'}`}>{p.meta.examCode}</p>
                    <p className="text-textMuted text-xs">{p.meta.examName}</p>
                  </div>
                  {!hasStarted && <span className="text-textDim text-[10px] tracking-widest">NOT STARTED</span>}
                  <span className="text-textDim text-[10px]">{p.questionBank.length}q</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedCerts.length === 0 && (
          <p className="text-orange-400 text-xs">Select at least one cert to begin.</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('question')}
            disabled={selectedCerts.length === 0 || questions.length === 0}
            className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            START ({questions.length}q)
          </button>
          <button onClick={() => router.back()} className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors">
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (phase === 'done') {
    const correctCount = results.filter((r) => r.correct).length;
    const pct = Math.round((correctCount / results.length) * 100);
    const isPerfect = correctCount === results.length;

    const byCert = selectedCerts.map((cid) => {
      const certResults = results.filter((r) => r.certId === cid);
      if (certResults.length === 0) return null;
      const certCorrect = certResults.filter((r) => r.correct).length;
      const certPct = Math.round((certCorrect / certResults.length) * 100);
      return { cid, certCorrect, total: certResults.length, certPct };
    }).filter(Boolean) as { cid: string; certCorrect: number; total: number; certPct: number }[];

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Mixed Quiz Complete</p>
          <h1 className="font-serif text-4xl">{correctCount}/{results.length} correct</h1>
          <p className="text-textMuted text-sm mt-1">{pct}% · {totalXp} XP earned{isPerfect ? ' · Perfect!' : ''}</p>
        </div>

        <div className="border border-border bg-bgCard p-5">
          <div className="h-3 bg-bg overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${pct >= 80 ? 'bg-gold' : pct >= 60 ? 'bg-orange-400' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Per-cert breakdown */}
        <div className="border border-border bg-bgCard p-5">
          <p className="text-textMuted text-[10px] tracking-widest uppercase mb-4">By Cert</p>
          <div className="space-y-3">
            {byCert.map(({ cid, certCorrect, total, certPct }) => {
              const p = certPacks[cid];
              return (
                <div key={cid}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text font-semibold">{p?.meta.examCode}</span>
                    <span className="text-textMuted">{certCorrect}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-bg">
                    <div
                      className={`h-full transition-all ${certPct >= 80 ? 'bg-gold' : certPct >= 60 ? 'bg-orange-400' : 'bg-red-500'}`}
                      style={{ width: `${certPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-3 hover:opacity-90 transition-opacity">
            DASHBOARD →
          </Link>
          <button
            onClick={() => { setIdx(0); setResults([]); setSelected([]); setTotalXp(0); setPhase('setup'); }}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-gold transition-colors"
          >
            New Mix
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTION / FEEDBACK ──
  if (!q || !entry) return null;

  const certPack = certPacks[entry.certId];
  const domain = certPack?.domains.find((d) => d.id === q.domainId);
  const correctSet = new Set(q.correctAnswers);
  const progress = ((idx + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="h-0.5 bg-border">
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold text-[10px] font-bold tracking-widest border border-gold/40 px-2 py-0.5">
              {certPack?.meta.examCode}
            </span>
            <span className="text-textMuted text-xs tracking-widest uppercase">{domain?.title ?? 'Unknown'}</span>
          </div>
          <span className="text-gold font-bold tabular-nums">{idx + 1} / {questions.length}</span>
        </div>

        <div className="border border-border bg-bgCard p-6">
          {isMulti && <p className="text-gold text-[10px] tracking-widest uppercase mb-3">Choose all that apply</p>}
          <p className="text-text text-lg leading-relaxed font-serif">{q.questionText}</p>
        </div>

        <div className="space-y-2">
          {q.choices.map((c, ci) => {
            const isSelected = selected.includes(c.id);
            const isFeedback = phase === 'feedback';
            const isRight = correctSet.has(c.id);
            let cls = '';
            if (!isFeedback) {
              cls = isSelected
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border bg-bgElevated text-text hover:border-gold/40 hover:bg-bgCard cursor-pointer';
            } else {
              if (isRight && isSelected) cls = 'border-green-500 bg-green-950/40 text-green-300';
              else if (isRight) cls = 'border-green-600 bg-green-950/20 text-green-400';
              else if (isSelected) cls = 'border-red-500 bg-red-950/40 text-red-300 line-through';
              else cls = 'border-border/40 bg-bgElevated text-textDim opacity-60';
            }
            return (
              <button
                key={c.id}
                disabled={isFeedback}
                onClick={() => !isFeedback && toggle(c.id)}
                className={`w-full text-left flex items-start gap-3 border px-4 py-3 transition-all duration-150 ${cls}`}
              >
                <span className="font-mono text-sm mt-0.5 shrink-0 w-5">{CHOICE_KEYS[ci]?.toUpperCase()}.</span>
                <span className="text-sm leading-relaxed flex-1">{c.text}</span>
                {isFeedback && isRight && <span className="text-green-400 text-xs font-bold shrink-0 self-center">✓</span>}
                {isFeedback && !isRight && isSelected && <span className="text-red-400 text-xs font-bold shrink-0 self-center">✗</span>}
              </button>
            );
          })}
        </div>

        {phase === 'feedback' && (
          <div className={`border p-5 space-y-3 ${isCorrect ? 'border-green-700 bg-green-950/30' : 'border-red-800 bg-red-950/20'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold tracking-widest ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </span>
              {isCorrect && <span className="text-gold text-xs font-semibold">+{XP_CORRECT} XP</span>}
            </div>
            {q.explanation && <p className="text-text text-sm leading-relaxed">{q.explanation}</p>}
            {q.examTrap && (
              <div className="border-t border-border/50 pt-3">
                <p className="text-gold text-[10px] tracking-widest uppercase mb-1">Exam Trap</p>
                <p className="text-textMuted text-sm">{q.examTrap}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {phase === 'question' ? (
            <>
              <p className="text-textDim text-xs">
                <kbd className="font-mono border border-border px-1">A–D</kbd> select ·{' '}
                <kbd className="font-mono border border-border px-1">Enter</kbd> confirm
              </p>
              <button
                onClick={submitAnswer}
                disabled={selected.length === 0}
                className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                CONFIRM
              </button>
            </>
          ) : (
            <>
              <p className="text-textDim text-xs">
                <kbd className="font-mono border border-border px-1">Space</kbd> to continue
              </p>
              <button
                onClick={advance}
                className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-2.5 hover:opacity-90 transition-opacity"
              >
                {idx < questions.length - 1 ? 'NEXT →' : 'FINISH'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
