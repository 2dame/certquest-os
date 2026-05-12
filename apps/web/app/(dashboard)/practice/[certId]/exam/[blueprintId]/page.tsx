'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { certPacks } from '@certquest/content';
import { assembleAttempt, scoreAttempt, type AnswerRecord, type ExamScoreReport } from '@certquest/practice-exam';
import { useStore } from '@/lib/store';

type Phase = 'taking' | 'scored' | 'reviewing';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export default function ExamRunnerPage() {
  const params = useParams<{ certId: string; blueprintId: string }>();
  const router = useRouter();
  const certId = params?.certId ?? '';
  const blueprintId = params?.blueprintId ?? '';

  const pack = certPacks[certId];
  const blueprint = pack?.practiceExams.find((e: any) => e.id === blueprintId);

  const attempt = useMemo(() => {
    if (!pack || !blueprint) return null;
    return assembleAttempt(blueprint, pack.questionBank, { seed: Date.now() });
  }, [pack, blueprint]); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState<Phase>('taking');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>((blueprint as any)?.timeLimitSeconds ?? 0);
  const [report, setReport] = useState<ExamScoreReport | null>(null);
  const recordPracticeExamAttempt = useStore((s) => s.recordPracticeExamAttempt);

  // Keep secondsLeft ref for submit closure
  const secondsLeftRef = useRef(secondsLeft);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

  // Timer
  useEffect(() => {
    if (phase !== 'taking') return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const submit = useCallback(() => {
    if (!attempt || !blueprint) return;
    const records: AnswerRecord[] = attempt.questions.map((qq: any) => ({
      questionId: qq.id,
      selectedAnswerIds: answers[qq.id] ?? [],
      timeSpentSeconds: Math.round(
        ((blueprint as any).timeLimitSeconds - secondsLeftRef.current) / attempt.questions.length
      ),
      flagged: !!flags[qq.id],
    }));
    const computed = scoreAttempt(attempt, records, blueprint);
    setReport(computed);
    recordPracticeExamAttempt({
      attemptId: `${(blueprint as any).id}-${Date.now()}`,
      certId: (blueprint as any).certId,
      blueprintId: (blueprint as any).id,
      rawPercent: computed.rawPercent,
      scaledScore: computed.scaledScore,
      passEstimate: computed.passEstimate,
      takenAt: new Date().toISOString(),
    });
    setPhase('scored');
  }, [attempt, blueprint, answers, flags, recordPracticeExamAttempt]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && phase === 'taking') submit();
  }, [secondsLeft, phase, submit]);

  // Keyboard shortcuts during exam
  useEffect(() => {
    if (phase !== 'taking' || !attempt) return;
    const q = attempt.questions[currentIdx];
    if (!q) return;

    function onKey(e: KeyboardEvent) {
      if (!q || !attempt) return;
      // Don't fire if typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();

      // A/B/C/D... to select choices
      const choiceIndex = CHOICE_KEYS.indexOf(key as typeof CHOICE_KEYS[number]);
      if (choiceIndex !== -1 && choiceIndex < q.choices.length) {
        const choiceId = q.choices[choiceIndex]!.id;
        toggleAnswer(q.id, choiceId, q.correctAnswers.length > 1);
        return;
      }

      if (key === 'f') {
        setFlags((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
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
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, attempt, currentIdx, submit]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleAnswer(qId: string, choiceId: string, isMulti: boolean) {
    setAnswers((prev) => {
      const cur = prev[qId] ?? [];
      if (isMulti) {
        return { ...prev, [qId]: cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId] };
      }
      return { ...prev, [qId]: [choiceId] };
    });
  }

  if (!pack || !blueprint || !attempt) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-textMuted">
        Exam not found.
      </div>
    );
  }

  const questions = attempt.questions;
  const totalQ = questions.length;
  const timeLimitSeconds = (blueprint as any).timeLimitSeconds ?? 0;
  const timerWarning = secondsLeft < 300 && secondsLeft > 0;
  const timerDanger = secondsLeft < 60;

  // ── SCORE REPORT ──────────────────────────────────────────────────────────
  if (phase === 'scored' && report) {
    return (
      <ScoreReport
        report={report}
        pack={pack}
        blueprint={blueprint}
        attempt={attempt}
        answers={answers}
        flags={flags}
        onReview={() => { setCurrentIdx(0); setPhase('reviewing'); }}
        onBack={() => router.push('/practice')}
      />
    );
  }

  // ── REVIEW MODE ───────────────────────────────────────────────────────────
  if (phase === 'reviewing' && report) {
    const q = questions[currentIdx];
    if (!q) return null;
    const selected = answers[q.id] ?? [];
    const correctIds = q.correctAnswers.map((a: any) => (typeof a === 'string' ? a : a.id));

    return (
      <div className="flex flex-col h-screen bg-bg text-text">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bgElevated shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPhase('scored')}
              className="text-gold text-sm hover:underline"
            >
              ← Back to Report
            </button>
            <span className="text-textMuted text-sm">
              Review Mode — Question {currentIdx + 1} of {totalQ}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="px-3 py-1 text-sm border border-border text-textMuted hover:text-text disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={currentIdx === totalQ - 1}
              onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
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
              Question {currentIdx + 1} · {flags[q.id] ? '🚩 Flagged' : ''}{q.correctAnswers.length > 1 ? ' · Choose all that apply' : ''}
            </p>
            <p className="text-lg leading-relaxed mb-8">{q.questionText}</p>

            <div className="space-y-3">
              {q.choices.map((c: any, ci: number) => {
                const cId = c.id;
                const isSelected = selected.includes(cId);
                const isCorrect = correctIds.includes(cId);

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
                    key={cId}
                    className={`flex items-start gap-3 border ${borderCls} ${bgCls} px-4 py-3 transition-colors`}
                  >
                    <span className="text-textMuted font-mono text-sm mt-0.5 shrink-0">
                      {CHOICE_KEYS[ci]?.toUpperCase()}.
                    </span>
                    <span className={`text-sm leading-relaxed flex-1 ${textCls}`}>{c.text}</span>
                    {badge && (
                      <span className={`text-xs font-semibold tracking-wider shrink-0 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
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
              {questions.map((qq: any, idx: number) => {
                const sel = answers[qq.id] ?? [];
                const corr = qq.correctAnswers.map((a: any) => (typeof a === 'string' ? a : a.id));
                const isCorrect = sel.length > 0 && sel.every((s: string) => corr.includes(s)) && corr.every((c: string) => sel.includes(c));
                const isWrong = sel.length > 0 && !isCorrect;
                const unanswered = sel.length === 0;

                let cls = 'bg-bgCard border-border text-textDim';
                if (idx === currentIdx) cls = 'border-gold text-gold bg-gold/10';
                else if (isCorrect) cls = 'bg-green-800/40 border-green-700 text-green-300';
                else if (isWrong) cls = 'bg-red-800/40 border-red-700 text-red-300';
                else if (unanswered) cls = 'bg-bgCard border-border text-textDim';

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

  // ── EXAM TAKING ───────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;
  const isMulti = q.correctAnswers.length > 1;
  const selected = answers[q.id] ?? [];
  const isFlagged = !!flags[q.id];
  const answeredCount = questions.filter((qq: any) => (answers[qq.id] ?? []).length > 0).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen bg-bg text-text">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bgElevated shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-widest text-textMuted uppercase">{(pack as any).certCode ?? certId} · Practice Exam</p>
          <h1 className="font-serif text-lg truncate">{(blueprint as any).title}</h1>
        </div>

        <div className="flex items-center gap-6 mx-6">
          <div className="text-xs text-textMuted text-center">
            <div className="text-base font-semibold text-text">{answeredCount}/{totalQ}</div>
            <div>answered</div>
          </div>
          {flaggedCount > 0 && (
            <div className="text-xs text-textMuted text-center">
              <div className="text-base font-semibold text-gold">{flaggedCount}</div>
              <div>flagged</div>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`font-mono text-2xl font-bold tabular-nums tracking-wider ${
          timerDanger ? 'text-red-400 animate-pulse' : timerWarning ? 'text-orange-400' : 'text-gold'
        }`}>
          {formatTime(secondsLeft)}
        </div>
      </header>

      {/* ── Body: two columns ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left: Question + Choices ── */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
          <p className="text-xs tracking-widest text-textMuted uppercase mb-4">
            Question {currentIdx + 1} of {totalQ}
            {isMulti && <span className="ml-2">· Choose all that apply</span>}
          </p>

          <p className="text-lg leading-relaxed mb-8">{q.questionText}</p>

          <div className="space-y-3">
            {q.choices.map((c: any, ci: number) => {
              const checked = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleAnswer(q.id, c.id, isMulti)}
                  className={`w-full text-left flex items-start gap-3 border px-4 py-3 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    checked
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border bg-bgElevated text-text hover:border-gold/40 hover:bg-bgCard'
                  }`}
                >
                  {/* Key hint */}
                  <span className={`font-mono text-sm mt-0.5 shrink-0 ${checked ? 'text-gold' : 'text-textDim'}`}>
                    {CHOICE_KEYS[ci]?.toUpperCase()}.
                  </span>
                  {/* Choice indicator */}
                  <span className={`shrink-0 mt-0.5 w-4 h-4 border flex items-center justify-center transition-colors ${
                    checked ? 'border-gold bg-gold' : 'border-border'
                  }`}>
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-bg" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm leading-relaxed">{c.text}</span>
                </button>
              );
            })}
          </div>

          {/* Flag + keyboard hint */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setFlags((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              className={`flex items-center gap-2 text-sm transition-colors ${
                isFlagged ? 'text-gold' : 'text-textMuted hover:text-text'
              }`}
            >
              <svg className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18m0-14.25S5.25 6 9 6s6-2.25 9-2.25v9S15.75 15 12 15 6 12.75 6 12.75v-9" />
              </svg>
              <span className="text-xs tracking-widest uppercase">{isFlagged ? 'Flagged' : 'Flag for review'} <kbd className="ml-1 opacity-50 font-mono">[F]</kbd></span>
            </button>

            <p className="text-xs text-textDim">
              <kbd className="font-mono">←→</kbd> navigate · <kbd className="font-mono">A–D</kbd> select · <kbd className="font-mono">Enter</kbd> next
            </p>
          </div>
        </div>

        {/* ── Right: Question Navigator ── */}
        <div className="w-64 shrink-0 border-l border-border bg-bgElevated flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="text-xs tracking-widest text-textMuted uppercase">Navigator</p>
            <p className="text-xs text-textDim mt-1">
              {answeredCount} of {totalQ} answered
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((qq: any, idx: number) => {
                const isAnswered = (answers[qq.id] ?? []).length > 0;
                const isFlaggedQ = !!flags[qq.id];
                const isCurrent = idx === currentIdx;

                let cls: string;
                if (isCurrent) {
                  cls = 'border-gold text-gold bg-gold/10';
                } else if (isFlaggedQ && isAnswered) {
                  cls = 'border-yellow-500 bg-yellow-500/20 text-yellow-300';
                } else if (isFlaggedQ) {
                  cls = 'border-yellow-600 bg-yellow-900/20 text-yellow-500';
                } else if (isAnswered) {
                  cls = 'border-gold/50 bg-gold/10 text-gold/80';
                } else {
                  cls = 'border-border bg-bgCard text-textDim hover:border-border/80 hover:text-textMuted';
                }

                return (
                  <button
                    key={qq.id}
                    onClick={() => setCurrentIdx(idx)}
                    title={`Q${idx + 1}${isFlaggedQ ? ' · Flagged' : ''}${isAnswered ? ' · Answered' : ''}`}
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
                { color: 'bg-gold/10 border-gold/50', label: 'Answered' },
                { color: 'bg-yellow-900/20 border-yellow-600', label: 'Flagged' },
                { color: 'bg-bgCard border-border', label: 'Unanswered' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 border ${color}`} />
                  <span className="text-xs text-textDim">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav buttons */}
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
                  Submit
                </button>
              )}
            </div>

            {currentIdx < totalQ - 1 && (
              <button
                onClick={submit}
                className="w-full py-2 text-sm border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Score Report Component ─────────────────────────────────────────────────

function ScoreReport({
  report,
  pack,
  blueprint,
  attempt,
  answers,
  flags,
  onReview,
  onBack,
}: {
  report: ExamScoreReport;
  pack: any;
  blueprint: any;
  attempt: any;
  answers: Record<string, string[]>;
  flags: Record<string, boolean>;
  onReview: () => void;
  onBack: () => void;
}) {
  const passed = report.passEstimate;

  return (
    <div className="min-h-screen bg-bg text-text overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Eyebrow */}
        <p className="text-xs tracking-[0.25em] text-gold uppercase mb-1">Score Report</p>
        <h1 className="font-serif text-3xl mb-8">{blueprint.title}</h1>

        {/* Hero score card */}
        <div className={`border p-8 mb-8 flex flex-col items-center text-center ${
          passed ? 'border-gold/50 bg-gold/5' : 'border-border bg-bgElevated'
        }`}>
          <div className="font-mono text-7xl font-bold text-gold mb-1">
            {report.scaledScore}
          </div>
          <div className="text-textMuted text-sm mb-4">
            of {report.scaledMax} · passing score {report.passingScaledScore}
          </div>
          <div className={`text-sm font-bold tracking-[0.2em] uppercase px-4 py-1.5 ${
            passed
              ? 'bg-gold text-bg'
              : 'bg-oxblood/60 text-red-300 border border-red-700'
          }`}>
            {passed ? 'Pass Estimate' : 'Not Yet'}
          </div>
          <div className="text-textMuted text-sm mt-4">
            {report.rawCorrect} / {report.rawTotal} correct &nbsp;·&nbsp; {report.rawPercent}%
          </div>
        </div>

        {/* Two columns: domain breakdown + remediation */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* Domain breakdown bar chart */}
          <div className="border border-border bg-bgElevated p-5">
            <p className="text-xs tracking-widest text-textMuted uppercase mb-4">Domain Breakdown</p>
            <div className="space-y-4">
              {report.domainBreakdown.map((d: any) => {
                const dom = (pack.domains as any[]).find((x: any) => x.id === d.domainId);
                const pct: number = d.percent ?? 0;
                const barColor = pct >= 70 ? 'bg-gold' : pct >= 50 ? 'bg-orange-400' : 'bg-red-500';
                return (
                  <div key={d.domainId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text truncate pr-2">{dom?.title ?? d.domainId}</span>
                      <span className="text-textMuted shrink-0">{d.correct}/{d.total} ({pct}%)</span>
                    </div>
                    {/* CSS-only bar */}
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
            <p className="text-xs tracking-widest text-textMuted uppercase mb-4">Remediation Plan</p>
            {report.remediationPlan.weakDomains.length === 0 ? (
              <p className="text-sm text-textMuted leading-relaxed">
                No weak domains detected. Maintain consistency and consider the final simulation.
              </p>
            ) : (
              <div className="space-y-3">
                {report.remediationPlan.weakDomains.map((w: any) => {
                  const dom = (pack.domains as any[]).find((x: any) => x.id === w.domainId);
                  const isSevere = w.severity === 'severe';
                  return (
                    <div key={w.domainId} className={`border p-3 ${isSevere ? 'border-red-800 bg-red-950/30' : 'border-border bg-bgCard'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm">{dom?.title ?? w.domainId}</span>
                        <span className={`text-xs font-bold tracking-wider shrink-0 ${isSevere ? 'text-red-400' : 'text-orange-400'}`}>
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
                  <span className="text-gold font-semibold">{report.generatedFlashcardSeeds.length}</span> flashcards seeded from misses — review them in the Flashcards module.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReview}
            className="px-6 py-3 border border-gold/50 text-gold hover:bg-gold/10 text-sm font-medium transition-colors"
          >
            Review Answers
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
