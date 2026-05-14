'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { certPacks } from '@certquest/content';
import {
  assembleAttempt,
  scoreAttempt,
  type AnswerRecord,
  type AssembledAttempt,
  type ExamScoreReport,
  type PracticeExamBlueprint,
} from '@certquest/practice-exam';
import { useStore } from '@/lib/store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'brief' | 'exam' | 'review';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

// XP values for simulation mode (half of normal per-correct, full pass bonus)
const SIM_XP_PER_CORRECT = 5;
const SIM_XP_PASS_BONUS = 50;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SimRunnerPage() {
  const params = useParams<{ certId: string; blueprintId: string }>();
  const router = useRouter();
  const certId = params?.certId ?? '';
  const blueprintId = params?.blueprintId ?? '';

  const pack = certPacks[certId];
  const blueprint: PracticeExamBlueprint | undefined = pack?.practiceExams.find(
    (e) => e.id === blueprintId,
  );

  const attempt = useMemo<AssembledAttempt | null>(() => {
    if (!pack || !blueprint) return null;
    return assembleAttempt(blueprint, pack.questionBank, { seed: Date.now() });
  }, [pack, blueprint]); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState<Phase>('brief');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(blueprint?.timeLimitSeconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [report, setReport] = useState<ExamScoreReport | null>(null);

  const recordPracticeExamAttempt = useStore((s) => s.recordPracticeExamAttempt);
  const addXp = useStore((s) => s.addXp);
  const recomputeReadinessForCert = useStore((s) => s.recomputeReadinessForCert);

  // Keep secondsLeft ref for submit closure
  const secondsLeftRef = useRef(secondsLeft);
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  // Timer — only runs in exam phase and when not paused
  useEffect(() => {
    if (phase !== 'exam' || paused) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, paused]);

  const submit = useCallback(() => {
    if (!attempt || !blueprint) return;
    const records: AnswerRecord[] = attempt.questions.map((qq) => ({
      questionId: qq.id,
      selectedAnswerIds: answers[qq.id] ?? [],
      timeSpentSeconds: Math.round(
        (blueprint.timeLimitSeconds - secondsLeftRef.current) / attempt.questions.length,
      ),
      flagged: false,
    }));
    const computed = scoreAttempt(attempt, records, blueprint);
    setReport(computed);

    // Record attempt
    recordPracticeExamAttempt({
      attemptId: `${blueprint.id}-sim-${Date.now()}`,
      certId: blueprint.certId,
      blueprintId: blueprint.id,
      rawPercent: computed.rawPercent,
      scaledScore: computed.scaledScore,
      passEstimate: computed.passEstimate,
      takenAt: new Date().toISOString(),
    });

    // Award XP: +5 per correct (half of normal), +50 if pass
    const xpEarned = computed.rawCorrect * SIM_XP_PER_CORRECT + (computed.passEstimate ? SIM_XP_PASS_BONUS : 0);
    addXp(xpEarned, blueprint.certId);
    recomputeReadinessForCert(blueprint.certId);

    setCurrentIdx(0);
    setPhase('review');
  }, [attempt, blueprint, answers, recordPracticeExamAttempt, addXp, recomputeReadinessForCert]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && phase === 'exam') submit();
  }, [secondsLeft, phase, submit]);

  // Keyboard shortcuts during exam phase
  useEffect(() => {
    if (phase !== 'exam' || !attempt) return;
    const q = attempt.questions[currentIdx];
    if (!q) return;

    function onKey(e: KeyboardEvent) {
      if (!q || !attempt) return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();

      const choiceIndex = CHOICE_KEYS.indexOf(key as (typeof CHOICE_KEYS)[number]);
      if (choiceIndex !== -1 && choiceIndex < q.choices.length) {
        const choice = q.choices[choiceIndex];
        if (choice) {
          toggleAnswer(q.id, choice.id, q.correctAnswers.length > 1);
        }
        return;
      }

      if (key === 'arrowleft' || key === 'arrowup') {
        e.preventDefault();
        setCurrentIdx((i) => Math.max(0, i - 1));
        return;
      }

      if (key === 'arrowright' || key === 'arrowdown') {
        e.preventDefault();
        setCurrentIdx((i) => Math.min(attempt.questions.length - 1, i + 1));
        return;
      }

      if (key === 'enter') {
        if (currentIdx === attempt.questions.length - 1) {
          submit();
        } else {
          setCurrentIdx((i) => Math.min(attempt.questions.length - 1, i + 1));
        }
        return;
      }

      if (key === 'p') {
        setPaused((prev) => !prev);
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, attempt, currentIdx, submit]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleAnswer(qId: string, choiceId: string, isMulti: boolean) {
    setAnswers((prev) => {
      const cur = prev[qId] ?? [];
      if (isMulti) {
        return {
          ...prev,
          [qId]: cur.includes(choiceId)
            ? cur.filter((x) => x !== choiceId)
            : [...cur, choiceId],
        };
      }
      return { ...prev, [qId]: [choiceId] };
    });
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!pack || !blueprint || !attempt) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-textMuted">
        Simulation not found.
      </div>
    );
  }

  const questions = attempt.questions;
  const totalQ = questions.length;
  const timeLimitSeconds = blueprint.timeLimitSeconds;
  const timerWarning = secondsLeft < 300 && secondsLeft > 0;
  const timerDanger = secondsLeft < 60;
  const answeredCount = questions.filter((qq) => (answers[qq.id] ?? []).length > 0).length;

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  if (phase === 'brief') {
    return (
      <BriefScreen
        blueprint={blueprint}
        totalQ={totalQ}
        timeLimitSeconds={timeLimitSeconds}
        certCode={(pack as { certCode?: string }).certCode ?? certId}
        onStart={() => {
          setSecondsLeft(blueprint.timeLimitSeconds);
          setPhase('exam');
        }}
        onBack={() => router.push('/practice')}
      />
    );
  }

  // ── REVIEW ────────────────────────────────────────────────────────────────
  if (phase === 'review' && report) {
    return (
      <ReviewScreen
        report={report}
        pack={pack}
        blueprint={blueprint}
        attempt={attempt}
        answers={answers}
        currentIdx={currentIdx}
        setCurrentIdx={setCurrentIdx}
        onBack={() => router.push('/practice')}
      />
    );
  }

  // ── EXAM ──────────────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;
  const isMulti = q.correctAnswers.length > 1;
  const selected = answers[q.id] ?? [];

  return (
    <div className="flex flex-col h-screen bg-bg text-text">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-bgElevated shrink-0 gap-4">
        {/* Mode label */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold border border-gold/40 px-2 py-0.5">
            SIMULATION MODE
          </span>
        </div>

        {/* Center: Q counter + answered */}
        <div className="flex items-center gap-6 text-xs text-textMuted">
          <span>
            <span className="text-text font-semibold text-sm">{currentIdx + 1}</span>
            <span className="text-textDim">/{totalQ}</span>
          </span>
          <span>
            <span className="text-text font-semibold text-sm">{answeredCount}</span>
            <span className="text-textDim"> answered</span>
          </span>
        </div>

        {/* Timer + pause */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`font-mono text-xl font-bold tabular-nums tracking-wider ${
              timerDanger
                ? 'text-red-400 animate-pulse'
                : timerWarning
                  ? 'text-orange-400'
                  : 'text-gold'
            }`}
          >
            {paused ? '--:--' : formatTime(secondsLeft)}
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            title={paused ? 'Resume [P]' : 'Pause [P]'}
            className={`text-xs border px-2 py-1 transition-colors ${
              paused
                ? 'border-gold text-gold bg-gold/10'
                : 'border-border text-textMuted hover:border-gold/40 hover:text-text'
            }`}
          >
            {paused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </header>

      {/* Pause overlay */}
      {paused && (
        <div className="flex-1 flex flex-col items-center justify-center bg-bg/95 z-10">
          <p className="text-2xl font-serif text-text mb-2">Exam Paused</p>
          <p className="text-textMuted text-sm mb-6">Timer is stopped. Your progress is saved.</p>
          <button
            onClick={() => setPaused(false)}
            className="px-8 py-3 bg-gold text-bg font-semibold text-sm hover:bg-gold/90 transition-colors"
          >
            Resume Simulation
          </button>
        </div>
      )}

      {/* ── Body ── */}
      {!paused && (
        <div className="flex flex-1 min-h-0">
          {/* ── Question + Choices ── */}
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
            <p className="text-xs tracking-widest text-textMuted uppercase mb-4">
              Question {currentIdx + 1} of {totalQ}
              {isMulti && <span className="ml-2">· Choose all that apply</span>}
            </p>

            <p className="text-lg leading-relaxed mb-8">{q.questionText}</p>

            <div className="space-y-3">
              {q.choices.map((c, ci) => {
                const isSelected = selected.includes(c.id);
                // Simulation mode: neutral styling — no green/red feedback
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleAnswer(q.id, c.id, isMulti)}
                    className={`w-full text-left flex items-start gap-3 border px-4 py-3 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                      isSelected
                        ? 'border-textMuted bg-bgCard text-text'
                        : 'border-border bg-bgElevated text-text hover:border-border/70 hover:bg-bgCard'
                    }`}
                  >
                    <span
                      className={`font-mono text-sm mt-0.5 shrink-0 ${isSelected ? 'text-text' : 'text-textDim'}`}
                    >
                      {CHOICE_KEYS[ci]?.toUpperCase()}.
                    </span>
                    {/* Neutral checkbox */}
                    <span
                      className={`shrink-0 mt-0.5 w-4 h-4 border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-textMuted bg-textMuted/20' : 'border-border'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-2.5 h-2.5 text-text"
                          fill="none"
                          viewBox="0 0 12 12"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm leading-relaxed">{c.text}</span>
                    {isSelected && (
                      <span className="ml-auto shrink-0 text-xs text-textMuted font-mono uppercase tracking-widest">
                        Answered
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end mt-8">
              <p className="text-xs text-textDim">
                <kbd className="font-mono">←→</kbd> navigate ·{' '}
                <kbd className="font-mono">A–D</kbd> select ·{' '}
                <kbd className="font-mono">P</kbd> pause
              </p>
            </div>
          </div>

          {/* ── Navigator ── */}
          <div className="w-64 shrink-0 border-l border-border bg-bgElevated flex flex-col">
            <div className="p-4 border-b border-border">
              <p className="text-xs tracking-widest text-textMuted uppercase">Navigator</p>
              <p className="text-xs text-textDim mt-1">{answeredCount} of {totalQ} answered</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((qq, idx) => {
                  const isAnswered = (answers[qq.id] ?? []).length > 0;
                  const isCurrent = idx === currentIdx;

                  let cls: string;
                  if (isCurrent) {
                    cls = 'border-gold text-gold bg-gold/10';
                  } else if (isAnswered) {
                    cls = 'border-textMuted/40 bg-bgCard text-textMuted';
                  } else {
                    cls = 'border-border bg-bgCard text-textDim hover:border-border/80 hover:text-textMuted';
                  }

                  return (
                    <button
                      key={qq.id}
                      onClick={() => setCurrentIdx(idx)}
                      title={`Q${idx + 1}${isAnswered ? ' · Answered' : ''}`}
                      className={`border text-xs font-mono py-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${cls}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 space-y-2">
                {[
                  { color: 'bg-bgCard border-textMuted/40', label: 'Answered' },
                  { color: 'bg-bgCard border-border', label: 'Unanswered' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 border ${color}`} />
                    <span className="text-xs text-textDim">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav + submit */}
            <div className="border-t border-border p-4 space-y-2">
              <div className="flex gap-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="flex-1 py-2 text-sm border border-border text-textMuted hover:text-text hover:border-gold/40 disabled:opacity-30 transition-colors"
                >
                  ← Back
                </button>
                {currentIdx < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
                    className="flex-1 py-2 text-sm border border-border text-textMuted hover:text-text hover:border-gold/40 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    className="flex-1 py-2 text-sm bg-gold text-bg font-semibold hover:bg-gold/90 transition-colors"
                  >
                    Finish
                  </button>
                )}
              </div>

              {currentIdx < totalQ - 1 && (
                <button
                  onClick={submit}
                  className="w-full py-2 text-sm border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
                >
                  End Simulation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brief Screen
// ---------------------------------------------------------------------------

function BriefScreen({
  blueprint,
  totalQ,
  timeLimitSeconds,
  certCode,
  onStart,
  onBack,
}: {
  blueprint: PracticeExamBlueprint;
  totalQ: number;
  timeLimitSeconds: number;
  certCode: string;
  onStart: () => void;
  onBack: () => void;
}) {
  const minutes = Math.round(timeLimitSeconds / 60);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <p className="text-xs tracking-[0.25em] text-gold uppercase mb-1">{certCode} · Simulation</p>
        <h1 className="font-serif text-3xl mb-2">{blueprint.title}</h1>
        <p className="text-textMuted text-sm mb-8">Full exam simulation — no feedback during the exam.</p>

        {/* Rules */}
        <div className="border border-border bg-bgElevated p-6 mb-8 space-y-4">
          <p className="text-xs tracking-widest text-textMuted uppercase mb-2">Simulation Rules</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-textMuted text-xs mb-1">Questions</div>
              <div className="font-semibold text-lg">{totalQ}</div>
            </div>
            <div>
              <div className="text-textMuted text-xs mb-1">Time Limit</div>
              <div className="font-semibold text-lg">{minutes} min</div>
            </div>
            <div>
              <div className="text-textMuted text-xs mb-1">Passing Score</div>
              <div className="font-semibold text-lg">{blueprint.passingScaledScore}</div>
            </div>
            <div>
              <div className="text-textMuted text-xs mb-1">Score Range</div>
              <div className="font-semibold text-lg">{blueprint.scaledScoreMin}–{blueprint.scaledScoreMax}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            {[
              'Answers are not revealed during the exam.',
              'No per-question correct/wrong feedback.',
              'All results shown after you submit.',
              'Timer counts down — exam auto-submits at zero.',
              'You may pause the timer at any time.',
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2 text-xs text-textMuted">
                <span className="text-gold mt-0.5 shrink-0">·</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStart}
            className="flex-1 py-3 bg-gold text-bg font-semibold text-sm hover:bg-gold/90 transition-colors"
          >
            Begin Simulation
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 border border-border text-textMuted hover:text-text text-sm transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Screen
// ---------------------------------------------------------------------------

function ReviewScreen({
  report,
  pack,
  blueprint,
  attempt,
  answers,
  currentIdx,
  setCurrentIdx,
  onBack,
}: {
  report: ExamScoreReport;
  pack: { domains: Array<{ id: string; title: string; weight?: number }>; certCode?: string };
  blueprint: PracticeExamBlueprint;
  attempt: AssembledAttempt;
  answers: Record<string, string[]>;
  currentIdx: number;
  setCurrentIdx: (idx: number) => void;
  onBack: () => void;
}) {
  const [view, setView] = useState<'report' | 'questions'>('report');

  const questions = attempt.questions;
  const totalQ = questions.length;
  const passed = report.passEstimate;

  // ── Report view ───────────────────────────────────────────────────────────
  if (view === 'report') {
    return (
      <div className="min-h-screen bg-bg text-text overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Eyebrow */}
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-1">Simulation Report</p>
          <h1 className="font-serif text-3xl mb-8">{blueprint.title}</h1>

          {/* Hero score card */}
          <div
            className={`border p-8 mb-8 flex flex-col items-center text-center ${
              passed ? 'border-gold/50 bg-gold/5' : 'border-border bg-bgElevated'
            }`}
          >
            <div className="font-mono text-7xl font-bold text-gold mb-1">{report.scaledScore}</div>
            <div className="text-textMuted text-sm mb-4">
              of {report.scaledMax} · passing score {report.passingScaledScore}
            </div>
            <div
              className={`text-sm font-bold tracking-[0.2em] uppercase px-4 py-1.5 ${
                passed
                  ? 'bg-gold text-bg'
                  : 'bg-oxblood/60 text-red-300 border border-red-700'
              }`}
            >
              {passed ? 'Pass Estimate' : 'Not Yet'}
            </div>
            <div className="text-textMuted text-sm mt-4">
              {report.rawCorrect} / {report.rawTotal} correct &nbsp;·&nbsp; {report.rawPercent}%
            </div>
          </div>

          {/* Two columns: domain breakdown + remediation */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Domain breakdown */}
            <div className="border border-border bg-bgElevated p-5">
              <p className="text-xs tracking-widest text-textMuted uppercase mb-4">Domain Breakdown</p>
              <div className="space-y-4">
                {report.domainBreakdown.map((d) => {
                  const dom = pack.domains.find((x) => x.id === d.domainId);
                  const pct: number = d.percent ?? 0;
                  const barColor =
                    pct >= 70 ? 'bg-gold' : pct >= 50 ? 'bg-orange-400' : 'bg-red-500';
                  return (
                    <div key={d.domainId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text truncate pr-2">{dom?.title ?? d.domainId}</span>
                        <span className="text-textMuted shrink-0">
                          {d.correct}/{d.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-bgCard border border-border/50 overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remediation */}
            <div className="border border-border bg-bgElevated p-5">
              <p className="text-xs tracking-widest text-textMuted uppercase mb-4">
                Remediation Plan
              </p>
              {report.remediationPlan.weakDomains.length === 0 ? (
                <p className="text-sm text-textMuted leading-relaxed">
                  No weak domains detected. Excellent simulation performance.
                </p>
              ) : (
                <div className="space-y-3">
                  {report.remediationPlan.weakDomains.map((w) => {
                    const dom = pack.domains.find((x) => x.id === w.domainId);
                    const isSevere = w.severity === 'severe';
                    return (
                      <div
                        key={w.domainId}
                        className={`border p-3 ${isSevere ? 'border-red-800 bg-red-950/30' : 'border-border bg-bgCard'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm">{dom?.title ?? w.domainId}</span>
                          <span
                            className={`text-xs font-bold tracking-wider shrink-0 ${isSevere ? 'text-red-400' : 'text-orange-400'}`}
                          >
                            {w.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-textMuted mt-1">{w.missedCount} missed</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {report.generatedFlashcardSeeds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-textMuted">
                    <span className="text-gold font-semibold">
                      {report.generatedFlashcardSeeds.length}
                    </span>{' '}
                    flashcards seeded from misses — review in the Flashcards module.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentIdx(0);
                setView('questions');
              }}
              className="px-6 py-3 border border-gold/50 text-gold hover:bg-gold/10 text-sm font-medium transition-colors"
            >
              Review All Questions
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 border border-border text-textMuted hover:text-text text-sm transition-colors"
            >
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question review view ──────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;

  const selected = answers[q.id] ?? [];
  const correctIds = q.correctAnswers;

  return (
    <div className="flex flex-col h-screen bg-bg text-text">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bgElevated shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('report')} className="text-gold text-sm hover:underline">
            ← Back to Report
          </button>
          <span className="text-textMuted text-sm">
            Review — Question {currentIdx + 1} of {totalQ}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            className="px-3 py-1 text-sm border border-border text-textMuted hover:text-text disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <button
            disabled={currentIdx === totalQ - 1}
            onClick={() => setCurrentIdx(Math.min(totalQ - 1, currentIdx + 1))}
            className="px-3 py-1 text-sm border border-border text-textMuted hover:text-text disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      </header>

      {/* Two-column */}
      <div className="flex flex-1 min-h-0">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-8">
          <p className="text-xs tracking-widest text-textMuted uppercase mb-4">
            Question {currentIdx + 1}
            {q.correctAnswers.length > 1 && (
              <span className="ml-2">· Choose all that apply</span>
            )}
          </p>
          <p className="text-lg leading-relaxed mb-8">{q.questionText}</p>

          <div className="space-y-3">
            {q.choices.map((c, ci) => {
              const isSelected = selected.includes(c.id);
              const isCorrect = correctIds.includes(c.id);

              let borderCls = 'border-border';
              let bgCls = 'bg-bgElevated';
              let textCls = 'text-text';
              let badge: string | null = null;

              if (isCorrect && isSelected) {
                borderCls = 'border-green-500';
                bgCls = 'bg-green-950/40';
                textCls = 'text-green-300';
                badge = 'Correct';
              } else if (isCorrect && !isSelected) {
                borderCls = 'border-green-700';
                bgCls = 'bg-green-950/20';
                textCls = 'text-green-400';
                badge = 'Correct answer';
              } else if (!isCorrect && isSelected) {
                borderCls = 'border-red-500';
                bgCls = 'bg-red-950/40';
                textCls = 'text-red-300';
                badge = 'Wrong';
              }

              return (
                <div
                  key={c.id}
                  className={`flex items-start gap-3 border ${borderCls} ${bgCls} px-4 py-3 transition-colors`}
                >
                  <span className="text-textMuted font-mono text-sm mt-0.5 shrink-0">
                    {CHOICE_KEYS[ci]?.toUpperCase()}.
                  </span>
                  <span className={`text-sm leading-relaxed flex-1 ${textCls}`}>{c.text}</span>
                  {badge !== null && (
                    <span
                      className={`text-xs font-semibold tracking-wider shrink-0 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {badge.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {q.explanation && (
            <div className="mt-6 border border-border bg-bgCard p-4">
              <p className="text-xs tracking-widest text-gold uppercase mb-2">Explanation</p>
              <p className="text-sm text-textMuted leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigator */}
        <div className="w-56 shrink-0 border-l border-border bg-bgElevated overflow-y-auto p-4">
          <p className="text-xs tracking-widest text-textMuted uppercase mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((qq, idx) => {
              const sel = answers[qq.id] ?? [];
              const corr = qq.correctAnswers;
              const isCorrect =
                sel.length > 0 &&
                sel.every((s) => corr.includes(s)) &&
                corr.every((c) => sel.includes(c));
              const isWrong = sel.length > 0 && !isCorrect;

              let cls = 'bg-bgCard border-border text-textDim';
              if (idx === currentIdx) cls = 'border-gold text-gold bg-gold/10';
              else if (isCorrect) cls = 'bg-green-800/40 border-green-700 text-green-300';
              else if (isWrong) cls = 'bg-red-800/40 border-red-700 text-red-300';

              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`border text-xs font-mono py-1 transition-colors ${cls}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
