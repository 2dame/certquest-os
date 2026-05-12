'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { certPacks, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';
import type { QuestionBankItem } from '@certquest/practice-exam';

type Phase = 'setup' | 'sprint' | 'results';

const DURATION_OPTIONS = [5, 10, 15, 25] as const;
type DurationMinutes = typeof DURATION_OPTIONS[number];

const CHOICE_KEYS = ['a', 'b', 'c', 'd'] as const;
type ChoiceKey = typeof CHOICE_KEYS[number];

const FEEDBACK_DELAY_MS = 1500;
const XP_PER_CORRECT = 10;

/** Fisher-Yates shuffle — returns a new array. */
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface AttemptedQuestion {
  questionId: string;
  domainId: string;
  objectiveId: string;
  isCorrect: boolean;
  selected: string;
}

export default function SprintPage() {
  const { certId } = useParams<{ certId: string }>();
  const router = useRouter();
  const addXp = useStore((s) => s.addXp);
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const recomputeReadiness = useStore((s) => s.recomputeReadinessForCert);

  const pack = certPacks[certId ?? ''];
  const lore = getCertLore(certId ?? '');

  // ── Setup state ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('setup');
  const [durationMin, setDurationMin] = useState<DurationMinutes>(10);

  // ── Sprint state ───────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPool, setQuestionPool] = useState<QuestionBankItem[]>([]);
  const [poolIdx, setPoolIdx] = useState(0);
  const [attempted, setAttempted] = useState<AttemptedQuestion[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Refs to avoid stale closures in timer / setTimeout
  const isEndingRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Current question ───────────────────────────────────────────────────────
  const currentQ: QuestionBankItem | undefined = questionPool[poolIdx];

  // ── End sprint (save + transition) ────────────────────────────────────────
  const endSprint = useCallback((finalAttempted: AttemptedQuestion[]) => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setIsEnding(true);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    const correctCount = finalAttempted.filter((a) => a.isCorrect).length;
    const totalXp = correctCount * XP_PER_CORRECT;

    recordQuizAttempt({
      certId: certId ?? '',
      attemptedAt: new Date().toISOString(),
      questionCount: finalAttempted.length,
      correctCount,
      questions: finalAttempted.map((a) => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        selected: [a.selected],
        objectiveId: a.objectiveId,
        domainId: a.domainId,
      })),
    });

    if (totalXp > 0) addXp(totalXp, certId ?? undefined);
    recomputeReadiness(certId ?? '');

    setPhase('results');
  }, [certId, recordQuizAttempt, addXp, recomputeReadiness]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'sprint') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger end on next tick to have latest attempted
          setAttempted((currentAttempted) => {
            endSprint(currentAttempted);
            return currentAttempted;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, endSprint]);

  // ── Advance to next question ───────────────────────────────────────────────
  const advanceQuestion = useCallback(() => {
    setSelectedChoice(null);
    setIsFeedback(false);
    setPoolIdx((prev) => {
      // Refill pool if exhausted — keep cycling
      if (prev + 1 >= questionPool.length) {
        setQuestionPool(shuffle(questionPool));
        return 0;
      }
      return prev + 1;
    });
  }, [questionPool]);

  // ── Select a choice ────────────────────────────────────────────────────────
  const selectChoice = useCallback((choiceId: string) => {
    if (isFeedback || !currentQ || isEndingRef.current) return;

    const isCorrect = currentQ.correctAnswers.includes(choiceId);
    setSelectedChoice(choiceId);
    setIsFeedback(true);

    const entry: AttemptedQuestion = {
      questionId: currentQ.id,
      domainId: currentQ.domainId,
      objectiveId: currentQ.objectiveId ?? '',
      isCorrect,
      selected: choiceId,
    };

    setAttempted((prev) => {
      const updated = [...prev, entry];
      return updated;
    });

    // Auto-advance after feedback delay
    advanceTimerRef.current = setTimeout(() => {
      advanceQuestion();
    }, FEEDBACK_DELAY_MS);
  }, [isFeedback, currentQ, advanceQuestion]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'sprint') return;
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const key = e.key.toLowerCase() as ChoiceKey | 'escape';

      if (key === 'escape') {
        setAttempted((current) => {
          endSprint(current);
          return current;
        });
        return;
      }

      const ki = CHOICE_KEYS.indexOf(key as ChoiceKey);
      if (ki !== -1 && currentQ && ki < currentQ.choices.length) {
        const choice = currentQ.choices[ki];
        if (choice) selectChoice(choice.id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, currentQ, selectChoice, endSprint]);

  // ── Start sprint ───────────────────────────────────────────────────────────
  function startSprint() {
    if (!pack || pack.questionBank.length === 0) return;
    const pool = shuffle(pack.questionBank);
    setQuestionPool(pool);
    setPoolIdx(0);
    setAttempted([]);
    setSelectedChoice(null);
    setIsFeedback(false);
    setTimeLeft(durationMin * 60);
    isEndingRef.current = false;
    setIsEnding(false);
    setPhase('sprint');
  }

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!pack || !lore) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">Cert not found.</p>
      </div>
    );
  }

  if (pack.questionBank.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">No questions available for this cert yet.</p>
      </div>
    );
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">{lore.worldName}</p>
          <h1 className="font-serif text-4xl">{pack.meta.examCode} — Sprint Mode</h1>
          <p className="text-textMuted text-sm mt-2">
            Answer as many questions as you can. Immediate feedback. Timer runs out = session over.
          </p>
        </div>

        <div className="border border-border bg-bgCard p-5 space-y-3">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-4">Choose Duration</p>
          <div className="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDurationMin(d)}
                className={`py-5 border text-center transition-colors ${
                  durationMin === d
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-bgElevated text-text hover:border-gold/40'
                }`}
              >
                <span className="font-serif text-3xl block">{d}</span>
                <span className="text-xs text-textMuted block mt-1">minutes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border bg-bgCard p-4 text-xs text-textMuted space-y-1">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-2">Keyboard shortcuts</p>
          <p><kbd className="font-mono border border-border px-1">A</kbd> <kbd className="font-mono border border-border px-1">B</kbd> <kbd className="font-mono border border-border px-1">C</kbd> <kbd className="font-mono border border-border px-1">D</kbd> — select answer (auto-advances)</p>
          <p><kbd className="font-mono border border-border px-1">Esc</kbd> — end session early</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startSprint}
            className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity"
          >
            START SPRINT
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

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const correctCount = attempted.filter((a) => a.isCorrect).length;
    const answeredCount = attempted.length;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const xpEarned = correctCount * XP_PER_CORRECT;

    // Domain breakdown
    const domainMap = new Map<string, { correct: number; total: number; title: string }>();
    for (const a of attempted) {
      const domain = pack.domains.find((d) => d.id === a.domainId);
      const title = domain?.title ?? a.domainId;
      const existing = domainMap.get(a.domainId);
      if (existing) {
        existing.total += 1;
        if (a.isCorrect) existing.correct += 1;
      } else {
        domainMap.set(a.domainId, { correct: a.isCorrect ? 1 : 0, total: 1, title });
      }
    }
    const domainEntries = [...domainMap.entries()].sort((a, b) => b[1].total - a[1].total);

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Sprint Complete</p>
          <h1 className="font-serif text-4xl">{correctCount} correct</h1>
          <p className="text-textMuted text-sm mt-1">
            {answeredCount} answered · {accuracy}% accuracy · +{xpEarned} XP
          </p>
        </div>

        {/* Accuracy bar */}
        <div className="border border-border bg-bgCard p-5">
          <div className="h-3 bg-bg overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                accuracy >= 80 ? 'bg-gold' : accuracy >= 60 ? 'bg-orange-400' : 'bg-red-500'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-textMuted mt-2">
            <span>{correctCount} correct</span>
            <span>{answeredCount - correctCount} missed</span>
          </div>
        </div>

        {/* Domain breakdown */}
        {domainEntries.length > 0 && (
          <div className="border border-border bg-bgCard p-5">
            <p className="text-textMuted text-[10px] tracking-widest uppercase mb-4">Domains Hit</p>
            <div className="space-y-3">
              {domainEntries.map(([domId, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div key={domId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text truncate pr-2">{data.title}</span>
                      <span className="text-textMuted shrink-0">{data.correct}/{data.total}</span>
                    </div>
                    <div className="h-1.5 bg-bg">
                      <div
                        className={`h-full transition-all ${
                          pct >= 80 ? 'bg-gold' : pct >= 60 ? 'bg-orange-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('setup')}
            className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-3 hover:opacity-90 transition-opacity"
          >
            SPRINT AGAIN
          </button>
          <Link
            href="/dashboard"
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-gold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── SPRINT ─────────────────────────────────────────────────────────────────
  if (!currentQ || isEnding) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">Loading…</p>
      </div>
    );
  }

  const answeredSoFar = attempted.length;
  const correctSoFar = attempted.filter((a) => a.isCorrect).length;
  const isLowTime = timeLeft < 60;
  const correctSet = new Set(currentQ.correctAnswers);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Top bar */}
      <div className="border-b border-border bg-bgElevated px-4 py-2 flex items-center justify-between gap-4">
        {/* Timer */}
        <span
          className={`font-mono text-xl font-bold tabular-nums transition-colors ${
            isLowTime ? 'text-red-400' : 'text-gold'
          }`}
        >
          {formatTime(timeLeft)}
        </span>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-textMuted">
          <span>
            <span className="text-text font-semibold">{answeredSoFar}</span> answered
          </span>
          <span>
            <span className="text-green-400 font-semibold">{correctSoFar}</span> correct
          </span>
        </div>

        {/* Escape hint */}
        <button
          onClick={() => setAttempted((cur) => { endSprint(cur); return cur; })}
          className="text-textDim text-xs border border-border px-2 py-1 hover:border-textMuted transition-colors"
        >
          End <kbd className="font-mono">[Esc]</kbd>
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6">
        {/* Domain label */}
        {(() => {
          const domain = pack.domains.find((d) => d.id === currentQ.domainId);
          return (
            <span className="text-textMuted text-xs tracking-widest uppercase">
              {domain?.title ?? currentQ.domainId}
            </span>
          );
        })()}

        {/* Question */}
        <div className="border border-border bg-bgCard p-6">
          <p className="text-text text-lg leading-relaxed font-serif">{currentQ.questionText}</p>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {currentQ.choices.map((c, ci) => {
            const isSelected = selectedChoice === c.id;
            const isRight = correctSet.has(c.id);

            let cls = '';
            if (!isFeedback) {
              cls =
                'border-border bg-bgElevated text-text hover:border-gold/40 hover:bg-bgCard cursor-pointer';
            } else {
              if (isRight && isSelected) {
                cls = 'border-green-500 bg-green-950/40 text-green-300';
              } else if (isRight && !isSelected) {
                cls = 'border-green-600 bg-green-950/20 text-green-400';
              } else if (!isRight && isSelected) {
                cls = 'border-red-500 bg-red-950/40 text-red-300 line-through';
              } else {
                cls = 'border-border/40 bg-bgElevated text-textDim opacity-60';
              }
            }

            return (
              <button
                key={c.id}
                disabled={isFeedback}
                onClick={() => !isFeedback && selectChoice(c.id)}
                className={`w-full text-left flex items-start gap-3 border px-4 py-3 transition-all duration-150 ${cls}`}
              >
                <span className="font-mono text-sm mt-0.5 shrink-0 w-5">
                  {CHOICE_KEYS[ci]?.toUpperCase()}.
                </span>
                <span className="text-sm leading-relaxed flex-1">{c.text}</span>
                {isFeedback && isRight && (
                  <span className="text-green-400 text-xs font-bold shrink-0 self-center">
                    CORRECT
                  </span>
                )}
                {isFeedback && !isRight && isSelected && (
                  <span className="text-red-400 text-xs font-bold shrink-0 self-center">
                    WRONG
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback status strip */}
        {isFeedback && (
          <div
            className={`border px-4 py-3 text-sm font-semibold tracking-wide ${
              attempted[attempted.length - 1]?.isCorrect
                ? 'border-green-700 bg-green-950/30 text-green-400'
                : 'border-red-800 bg-red-950/20 text-red-400'
            }`}
          >
            {attempted[attempted.length - 1]?.isCorrect ? `Correct  +${XP_PER_CORRECT} XP` : 'Incorrect — next question incoming…'}
          </div>
        )}

        {/* Keyboard hint */}
        {!isFeedback && (
          <p className="text-textDim text-xs">
            <kbd className="font-mono border border-border px-1">A</kbd>–
            <kbd className="font-mono border border-border px-1">D</kbd> to select · auto-advances after feedback
          </p>
        )}
      </div>
    </div>
  );
}
