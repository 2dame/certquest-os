'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { certPacks, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';
import { useTts } from '@/lib/useTts';

type Phase = 'intro' | 'question' | 'feedback' | 'done';

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;
const QUIZ_SIZE = 10;
const XP_CORRECT = 10;
const XP_QUIZ_BONUS = 25;

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export default function QuizPage() {
  const { certId } = useParams<{ certId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainFocus = searchParams.get('domainFocus');

  const pack = certPacks[certId ?? ''];
  const lore = getCertLore(certId ?? '');
  const { speak, stop } = useTts();
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const addXp = useStore((s) => s.addXp);
  const recomputeReadiness = useStore((s) => s.recomputeReadinessForCert);
  const wrongAnswerLog = useStore((s) => s.wrongAnswerLog);
  const settingsDomainFocus = useStore((s) => s.settings.domainFocus);

  const FOCUSED_SIZE = 5;
  const effectiveSize = domainFocus ? FOCUSED_SIZE : QUIZ_SIZE;

  // Build a domain-weighted question set with adaptive difficulty + domain focus
  const questions = useMemo(() => {
    if (!pack) return [];

    // Single-domain drill (from URL param)
    if (domainFocus) {
      return [...pack.questionBank]
        .filter((q) => q.domainId === domainFocus)
        .sort(() => Math.random() - 0.5)
        .slice(0, FOCUSED_SIZE);
    }

    // Compute adaptive struggle score per question (based on wrong answer history)
    const getStruggleScore = (qId: string) => {
      const key = `${certId}:${qId}`;
      const entry = wrongAnswerLog[key];
      if (!entry) return 0;
      return entry.timesWrong / (entry.timesWrong + entry.timesCorrect + 1);
    };

    const focusedDomains = settingsDomainFocus[certId ?? ''] ?? [];
    const bank = [...pack.questionBank];
    const perDomain: Record<string, typeof bank> = {};
    for (const q of bank) {
      (perDomain[q.domainId] ??= []).push(q);
    }

    const picks: typeof bank = [];
    const totalWeight = pack.domains.reduce((s, d) => s + (d.weight ?? 0), 0);
    for (const domain of pack.domains) {
      const isFocused = focusedDomains.includes(domain.id);
      const effectiveWeight = isFocused ? (domain.weight ?? 0) * 2 : (domain.weight ?? 0);
      const share = Math.max(1, Math.round((effectiveWeight / (totalWeight + focusedDomains.length * totalWeight)) * QUIZ_SIZE));
      const domainQuestions = (perDomain[domain.id] ?? [])
        // Adaptive: sort so struggled questions come first, then shuffle rest
        .sort((a, b) => {
          const sa = getStruggleScore(a.id);
          const sb = getStruggleScore(b.id);
          if (Math.abs(sa - sb) > 0.1) return sb - sa; // higher struggle first
          return Math.random() - 0.5;
        });
      picks.push(...domainQuestions.slice(0, share));
    }
    return picks.slice(0, QUIZ_SIZE).sort(() => Math.random() - 0.5);
  }, [pack, domainFocus, wrongAnswerLog, settingsDomainFocus, certId]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<{ qId: string; correct: boolean; domainId: string; objectiveId: string; selected: string[] }[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  const q = questions[idx];
  const isMulti = q ? q.correctAnswers.length > 1 : false;
  const isCorrect = q ? sameSet(selected, q.correctAnswers) : false;

  function toggle(choiceId: string) {
    if (!q) return;
    setSelected((prev) => {
      if (isMulti) {
        return prev.includes(choiceId) ? prev.filter((x) => x !== choiceId) : [...prev, choiceId];
      }
      return [choiceId];
    });
  }

  const submitAnswer = useCallback(() => {
    if (!q || selected.length === 0) return;
    const correct = sameSet(selected, q.correctAnswers);
    const xpEarned = correct ? XP_CORRECT : 0;
    setResults((r) => [...r, { qId: q.id, correct, domainId: q.domainId, objectiveId: q.objectiveId ?? '', selected }]);
    setTotalXp((x) => x + xpEarned);
    if (correct) addXp(xpEarned);
    setPhase('feedback');
  }, [q, selected, addXp]);

  function advance() {
    stop();
    setSelected([]);
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
      setPhase('question');
    } else {
      // Final: record attempt
      const allResults = [...results, ...(phase === 'feedback' ? [] : [])];
      const correctCount = allResults.filter((r) => r.correct).length;
      if (correctCount === questions.length) addXp(XP_QUIZ_BONUS);
      setTotalXp((x) => correctCount === questions.length ? x + XP_QUIZ_BONUS : x);
      recordQuizAttempt({
        certId: certId ?? '',
        attemptedAt: new Date().toISOString(),
        questionCount: questions.length,
        correctCount: allResults.filter((r) => r.correct).length,
        questions: allResults.map((r) => ({
          questionId: r.qId,
          isCorrect: r.correct,
          selected: r.selected,
          objectiveId: r.objectiveId,
          domainId: r.domainId,
        })),
      });
      recomputeReadiness(certId ?? '');
      setPhase('done');
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (phase === 'intro' || phase === 'done') return;
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

  if (!pack || !lore) {
    return <div className="flex items-center justify-center h-64"><p className="text-textMuted">Cert not found.</p></div>;
  }
  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-textMuted">No questions available yet.</p></div>;
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">{lore.worldName}</p>
          <h1 className="font-serif text-4xl">
            {domainFocus
              ? `${pack.domains.find((d) => d.id === domainFocus)?.title ?? 'Domain'} Drill`
              : `${pack.meta.examCode} — Quick Quiz`}
          </h1>
          <p className="text-textMuted text-sm mt-2">{effectiveSize} questions · immediate feedback · no time limit</p>
        </div>
        <div className="border border-border bg-bgCard p-5 space-y-2">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-3">How it works</p>
          <p className="text-text text-sm">· Select an answer — feedback appears immediately after each question</p>
          <p className="text-text text-sm">· Correct answer + explanation shown on every question</p>
          <p className="text-text text-sm">· +{XP_CORRECT} XP per correct answer · +{XP_QUIZ_BONUS} XP bonus for a perfect run</p>
          <p className="text-text text-sm">· Results update your readiness score</p>
        </div>
        <div className="border border-border bg-bgCard p-4 text-xs text-textMuted space-y-1">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-2">Keyboard shortcuts</p>
          <p>A / B / C / D — select choice</p>
          <p>Space or Enter — confirm / next</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('question')}
            className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity"
          >
            START
          </button>
          <button onClick={() => router.back()} className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors">
            Not now
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (phase === 'done') {
    const correctCount = results.filter((r) => r.correct).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const isPerfect = correctCount === questions.length;

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Quiz Complete</p>
          <h1 className="font-serif text-4xl">{correctCount}/{questions.length} correct</h1>
          <p className="text-textMuted text-sm mt-1">{pct}% · {totalXp} XP earned{isPerfect ? ' · Perfect run!' : ''}</p>
        </div>

        <div className="border border-border bg-bgCard p-5">
          <div className="h-3 bg-bg rounded-none overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${pct >= 80 ? 'bg-gold' : pct >= 60 ? 'bg-orange-400' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-textMuted mt-2">
            <span>{correctCount} correct</span>
            <span>{questions.length - correctCount} missed</span>
          </div>
        </div>

        {/* Per-domain breakdown */}
        {pack.domains.length > 0 && (
          <div className="border border-border bg-bgCard p-5">
            <p className="text-textMuted text-[10px] tracking-widest uppercase mb-4">By Domain</p>
            <div className="space-y-3">
              {pack.domains.map((d) => {
                const domQ = results.filter((r) => r.domainId === d.id);
                if (domQ.length === 0) return null;
                const domCorrect = domQ.filter((r) => r.correct).length;
                const domPct = Math.round((domCorrect / domQ.length) * 100);
                return (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text truncate pr-2">{d.title}</span>
                      <span className="text-textMuted shrink-0">{domCorrect}/{domQ.length}</span>
                    </div>
                    <div className="h-1.5 bg-bg">
                      <div
                        className={`h-full transition-all ${domPct >= 80 ? 'bg-gold' : domPct >= 60 ? 'bg-orange-400' : 'bg-red-500'}`}
                        style={{ width: `${domPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weak domain auto-queue */}
        {(() => {
          const weakDomains = pack.domains.filter((d) => {
            const domQ = results.filter((r) => r.domainId === d.id);
            if (domQ.length === 0) return false;
            const domPct = Math.round((domQ.filter((r) => r.correct).length / domQ.length) * 100);
            return domPct < 60;
          });
          if (weakDomains.length === 0) return null;
          return (
            <div className="border border-orange-800 bg-orange-950/20 p-4 space-y-3">
              <p className="text-orange-400 text-[10px] tracking-widest uppercase font-semibold">Weak Domain Detected</p>
              <div className="space-y-2">
                {weakDomains.map((d) => {
                  const domQ = results.filter((r) => r.domainId === d.id);
                  const domPct = Math.round((domQ.filter((r) => r.correct).length / domQ.length) * 100);
                  return (
                    <div key={d.id} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-text text-sm font-semibold">{d.title}</p>
                        <p className="text-textMuted text-xs">{domPct}% — needs work</p>
                      </div>
                      <Link
                        href={`/quiz/${certId}?domainFocus=${d.id}`}
                        className="border border-orange-700 text-orange-400 text-xs font-bold tracking-widest px-4 py-1.5 hover:bg-orange-950/40 transition-colors shrink-0"
                      >
                        DRILL 5 MORE →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="flex gap-3">
          <Link href="/dashboard" className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-3 hover:opacity-90 transition-opacity">
            DASHBOARD →
          </Link>
          <button
            onClick={() => { setIdx(0); setResults([]); setSelected([]); setTotalXp(0); setPhase('intro'); }}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-gold transition-colors"
          >
            Try Again
          </button>
          {results.filter((r) => !r.correct).length > 0 && (
            <Link href={`/practice/wrong-answers?certId=${certId}`} className="border border-red-800 text-red-400 text-sm px-6 py-3 hover:bg-red-950/30 transition-colors">
              Review Misses
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── QUESTION / FEEDBACK ──
  if (!q) return null;

  const progress = ((idx + 1) / questions.length) * 100;
  const domain = pack.domains.find((d) => d.id === q.domainId);
  const correctSet = new Set(q.correctAnswers);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Progress bar */}
      <div className="h-0.5 bg-border mb-0">
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-textMuted text-xs tracking-widest uppercase">{domain?.title ?? 'Unknown'}</span>
          <span className="text-gold font-bold tabular-nums">{idx + 1} / {questions.length}</span>
        </div>

        {/* Question */}
        <div className="border border-border bg-bgCard p-6">
          {isMulti && <p className="text-gold text-[10px] tracking-widest uppercase mb-3">Choose all that apply</p>}
          <p className="text-text text-lg leading-relaxed font-serif">{q.questionText}</p>
          <button onClick={() => speak(q.questionText)} className="text-textDim hover:text-gold transition-colors text-xs mt-2">▶ read aloud</button>
        </div>

        {/* Choices */}
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
              else if (isRight && !isSelected) cls = 'border-green-600 bg-green-950/20 text-green-400';
              else if (!isRight && isSelected) cls = 'border-red-500 bg-red-950/40 text-red-300 line-through';
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
                {isFeedback && isRight && (
                  <span className="text-green-400 text-xs font-bold shrink-0 self-center">✓ CORRECT</span>
                )}
                {isFeedback && !isRight && isSelected && (
                  <span className="text-red-400 text-xs font-bold shrink-0 self-center">✗ WRONG</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback block */}
        {phase === 'feedback' && (
          <div className={`border p-5 space-y-3 ${isCorrect ? 'border-green-700 bg-green-950/30' : 'border-red-800 bg-red-950/20'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold tracking-widest ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </span>
              {isCorrect && <span className="text-gold text-xs font-semibold">+{XP_CORRECT} XP</span>}
            </div>
            {q.explanation && (
              <p className="text-text text-sm leading-relaxed">{q.explanation}</p>
            )}
            {q.examTrap && (
              <div className="border-t border-border/50 pt-3">
                <p className="text-gold text-[10px] tracking-widest uppercase mb-1">Exam Trap</p>
                <p className="text-textMuted text-sm">{q.examTrap}</p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
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
                <kbd className="font-mono border border-border px-1">Space</kbd> or{' '}
                <kbd className="font-mono border border-border px-1">→</kbd> to continue
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
