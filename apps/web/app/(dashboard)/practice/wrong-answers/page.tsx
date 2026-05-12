'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { certPacks, certDisplayOrder, findQuestionById, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

// ── Drill mode types ───────────────────────────────────────────────────────────
interface DrillItem {
  questionId: string;
  certId: string;
  objectiveId: string;
  domainId: string;
}

type DrillPhase = 'selecting' | 'feedback';

interface DrillState {
  queue: DrillItem[];
  currentIndex: number;
  phase: DrillPhase;
  selectedChoiceId: string | null;
  wasCorrect: boolean | null;
  totalAttempted: number;
  totalCorrect: number;
}

export default function WrongAnswersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramCertId = searchParams.get('certId');

  const activeCertId = useStore((s) => s.activeCertId);
  const getWrongAnswers = useStore((s) => s.getWrongAnswers);
  const wrongAnswerLog = useStore((s) => s.wrongAnswerLog);
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const certId = paramCertId ?? activeCertId;
  const pack = certPacks[certId];
  const lore = getCertLore(certId);

  const wrongAnswers = useMemo(
    () => (mounted ? getWrongAnswers(certId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [certId, mounted, wrongAnswerLog],
  );

  // ── Two-panel state ────────────────────────────────────────────────────────
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Reset view when cert or list changes
  useEffect(() => {
    setSelectedIdx(0);
    setRevealed(false);
  }, [certId]);

  // ── Drill mode state ───────────────────────────────────────────────────────
  const [drillActive, setDrillActive] = useState(false);
  const [drillState, setDrillState] = useState<DrillState | null>(null);

  function enterDrill() {
    if (wrongAnswers.length === 0) return;
    const queue: DrillItem[] = wrongAnswers.map((w) => ({
      questionId: w.questionId,
      certId: w.certId,
      objectiveId: w.objectiveId,
      domainId: w.domainId,
    }));
    setDrillState({
      queue,
      currentIndex: 0,
      phase: 'selecting',
      selectedChoiceId: null,
      wasCorrect: null,
      totalAttempted: 0,
      totalCorrect: 0,
    });
    setDrillActive(true);
  }

  function exitDrill() {
    setDrillActive(false);
    setDrillState(null);
  }

  // Derived drill values
  const drillItem = drillState && drillState.currentIndex < drillState.queue.length
    ? drillState.queue[drillState.currentIndex]!
    : null;
  const drillFound = drillItem ? findQuestionById(drillItem.questionId) : null;
  const drillQuestion = drillFound?.question ?? null;
  const drillCorrectSet = drillQuestion ? new Set(drillQuestion.correctAnswers) : new Set<string>();

  const drillTotalStarted = drillState
    ? drillState.totalAttempted + drillState.queue.length - drillState.currentIndex
    : 0;
  const drillResolved = drillState ? drillState.totalCorrect : 0;
  const drillTotalAll = drillState
    ? drillState.totalCorrect + (drillState.queue.length - drillState.currentIndex)
    : 0;

  function confirmDrillAnswer() {
    if (!drillState || !drillItem || !drillQuestion || !drillState.selectedChoiceId) return;

    const isCorrect = drillCorrectSet.has(drillState.selectedChoiceId);

    recordQuizAttempt({
      certId: drillItem.certId,
      attemptedAt: new Date().toISOString(),
      questionCount: 1,
      correctCount: isCorrect ? 1 : 0,
      questions: [
        {
          questionId: drillItem.questionId,
          isCorrect,
          selected: [drillState.selectedChoiceId],
          objectiveId: drillItem.objectiveId,
          domainId: drillItem.domainId,
        },
      ],
    });

    setDrillState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'feedback',
        wasCorrect: isCorrect,
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
      };
    });
  }

  function advanceDrill() {
    if (!drillState) return;

    const wasCorrect = drillState.wasCorrect;
    const currentItem = drillState.queue[drillState.currentIndex]!;

    setDrillState((prev) => {
      if (!prev) return prev;

      let newQueue = [...prev.queue];
      // Remove the current item from its position
      newQueue.splice(prev.currentIndex, 1);

      // If wrong, push to end of queue
      if (!wasCorrect) {
        newQueue.push(currentItem);
      }

      const newIndex = prev.currentIndex < newQueue.length ? prev.currentIndex : 0;

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newIndex,
        phase: 'selecting',
        selectedChoiceId: null,
        wasCorrect: null,
      };
    });
  }

  // ── Drill keyboard shortcuts ───────────────────────────────────────────────
  const handleDrillKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!drillActive || !drillState || !drillQuestion) return;

      const key = e.key.toLowerCase();

      if (drillState.phase === 'selecting') {
        // A/B/C/D/E to select choice
        const keyIndex = CHOICE_KEYS.indexOf(key as typeof CHOICE_KEYS[number]);
        if (keyIndex !== -1 && keyIndex < drillQuestion.choices.length) {
          const choice = drillQuestion.choices[keyIndex];
          if (choice) {
            setDrillState((prev) => prev ? { ...prev, selectedChoiceId: choice.id } : prev);
          }
          return;
        }
        // Space/Enter to confirm when answer selected
        if ((e.key === ' ' || e.key === 'Enter') && drillState.selectedChoiceId) {
          e.preventDefault();
          confirmDrillAnswer();
          return;
        }
      } else if (drillState.phase === 'feedback') {
        // Space/Enter to advance
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          advanceDrill();
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drillActive, drillState, drillQuestion],
  );

  useEffect(() => {
    if (!drillActive) return;
    window.addEventListener('keydown', handleDrillKeyDown);
    return () => window.removeEventListener('keydown', handleDrillKeyDown);
  }, [drillActive, handleDrillKeyDown]);

  function markResolved(questionId: string) {
    if (!pack) return;
    const entry = wrongAnswers.find((w) => w.questionId === questionId);
    if (!entry) return;
    recordQuizAttempt({
      certId,
      attemptedAt: new Date().toISOString(),
      questionCount: 1,
      correctCount: 1,
      questions: [
        {
          questionId,
          isCorrect: true,
          selected: [],
          objectiveId: entry.objectiveId,
          domainId: entry.domainId,
        },
      ],
    });
    setSelectedIdx((i) => Math.min(i, Math.max(0, wrongAnswers.length - 2)));
    setRevealed(false);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  if (!pack || !lore) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm">Cert not found.</p>
      </div>
    );
  }

  // ── EMPTY STATE ────────────────────────────────────────────────────────────
  const renderCertSwitcher = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {certDisplayOrder.map((cid) => {
        const p = certPacks[cid]!;
        const isActive = cid === certId;
        return (
          <button
            key={cid}
            onClick={() => router.replace(`/practice/wrong-answers?certId=${cid}`)}
            className={[
              'px-3 py-1.5 border text-xs font-semibold tracking-widest transition-colors',
              isActive
                ? 'border-gold text-gold bg-bgElevated'
                : 'border-border text-textMuted hover:border-textMuted',
            ].join(' ')}
          >
            {p.meta.examCode}
          </button>
        );
      })}
    </div>
  );

  if (wrongAnswers.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">{lore.worldName}</p>
          <h1 className="font-serif text-4xl text-text">Wrong Answer Review</h1>
        </div>
        {renderCertSwitcher()}
        <div className="border border-border bg-bgElevated p-6">
          <p className="text-gold font-semibold text-lg mb-2">Clean slate.</p>
          <p className="text-text text-sm leading-relaxed">
            No unresolved wrong answers for {pack.meta.examCode}. Either you haven't missed any yet,
            or you've corrected every miss.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-textMuted text-sm border border-border px-6 py-3 hover:border-textMuted transition-colors"
        >
          ← Back to Practice
        </button>
      </div>
    );
  }

  // ── DRILL MODE ─────────────────────────────────────────────────────────────
  if (drillActive && drillState) {
    // Completion screen
    if (drillState.queue.length === 0 || drillState.currentIndex >= drillState.queue.length) {
      return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg">
          {/* Drill header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-bgElevated flex-shrink-0">
            <button
              onClick={exitDrill}
              className="text-textMuted text-xs border border-border px-4 py-2 hover:border-textMuted transition-colors"
            >
              X Exit Drill
            </button>
            <p className="text-gold text-[10px] tracking-[0.25em] uppercase">Drill Mode</p>
            <div className="w-24" />
          </div>

          {/* Completion */}
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-md w-full px-4 space-y-6 text-center">
              <div className="border border-green-500 bg-green-950/40 p-8 space-y-4">
                <p className="text-green-400 text-[10px] tracking-[0.3em] uppercase font-bold">
                  Drill Complete
                </p>
                <p className="font-serif text-text text-3xl">All clear.</p>
                <p className="text-textMuted text-sm leading-relaxed">
                  You've correctly answered every question in the drill queue.
                </p>
                <div className="flex justify-center gap-8 pt-2">
                  <div>
                    <p className="text-text font-bold text-2xl">{drillState.totalCorrect}</p>
                    <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase">Correct</p>
                  </div>
                  <div>
                    <p className="text-text font-bold text-2xl">{drillState.totalAttempted}</p>
                    <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase">Attempts</p>
                  </div>
                  <div>
                    <p className="text-text font-bold text-2xl">
                      {drillState.totalAttempted > 0
                        ? Math.round((drillState.totalCorrect / drillState.totalAttempted) * 100)
                        : 0}%
                    </p>
                    <p className="text-textMuted text-[10px] tracking-[0.2em] uppercase">Accuracy</p>
                  </div>
                </div>
              </div>
              <button
                onClick={exitDrill}
                className="border border-gold text-gold text-sm tracking-[0.15em] px-8 py-3 hover:bg-gold hover:text-bg transition-colors font-semibold"
              >
                BACK TO REVIEW
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Progress values
    const totalInDrill = drillState.totalCorrect + (drillState.queue.length - drillState.currentIndex);
    const resolvedInDrill = drillState.totalCorrect;
    const progressPct = totalInDrill > 0 ? (resolvedInDrill / (resolvedInDrill + (drillState.queue.length - drillState.currentIndex))) * 100 : 0;

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg">
        {/* Drill header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-bgElevated flex-shrink-0">
          <button
            onClick={exitDrill}
            className="text-textMuted text-xs border border-border px-4 py-2 hover:border-textMuted transition-colors"
          >
            X Exit Drill
          </button>
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase">Drill Mode — {pack.meta.examCode}</p>
          <span className="text-textMuted text-xs w-24 text-right">
            {resolvedInDrill} / {resolvedInDrill + (drillState.queue.length - drillState.currentIndex)} resolved
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-bgElevated flex-shrink-0">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question area */}
        {drillItem && drillQuestion ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="max-w-3xl w-full mx-auto px-6 py-8 space-y-6 flex-1">
              {/* Question text */}
              <p className="font-serif text-text text-xl leading-relaxed">
                {drillQuestion.questionText}
              </p>

              {/* Choices */}
              <div className="space-y-3">
                {drillQuestion.choices.map((c, idx) => {
                  const keyLabel = CHOICE_KEYS[idx] ?? c.id;
                  const isSelected = drillState.selectedChoiceId === c.id;
                  const isCorrect = drillCorrectSet.has(c.id);
                  const isFeedback = drillState.phase === 'feedback';

                  let borderClass = 'border-border';
                  let bgClass = 'bg-bgElevated';
                  let labelBorderClass = 'border-border';
                  let labelTextClass = 'text-textMuted';
                  let textClass = 'text-text';

                  if (isFeedback) {
                    if (isCorrect) {
                      borderClass = 'border-green-500';
                      bgClass = 'bg-green-950/40';
                      labelBorderClass = 'border-green-500';
                      labelTextClass = 'text-green-400';
                      textClass = 'text-green-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-red-500';
                      bgClass = 'bg-red-950/40';
                      labelBorderClass = 'border-red-500';
                      labelTextClass = 'text-red-400';
                      textClass = 'text-red-300';
                    }
                  } else {
                    if (isSelected) {
                      borderClass = 'border-gold';
                      bgClass = 'bg-bgElevated';
                      labelBorderClass = 'border-gold';
                      labelTextClass = 'text-gold';
                    }
                  }

                  return (
                    <button
                      key={c.id}
                      disabled={isFeedback}
                      onClick={() => {
                        if (drillState.phase !== 'selecting') return;
                        setDrillState((prev) =>
                          prev ? { ...prev, selectedChoiceId: c.id } : prev
                        );
                      }}
                      className={[
                        'w-full text-left border p-4 flex gap-3 transition-colors',
                        borderClass,
                        bgClass,
                        !isFeedback && !isSelected ? 'hover:border-textMuted' : '',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex-shrink-0 w-6 h-6 border flex items-center justify-center text-[10px] font-bold',
                          labelBorderClass,
                          labelTextClass,
                        ].join(' ')}
                      >
                        {keyLabel.toUpperCase()}
                      </span>
                      <span className={['text-sm leading-relaxed', textClass].join(' ')}>
                        {c.text}
                      </span>
                      {isFeedback && isCorrect && (
                        <span className="ml-auto text-green-400 text-xs self-center flex-shrink-0 font-bold tracking-widest">
                          CORRECT
                        </span>
                      )}
                      {isFeedback && isSelected && !isCorrect && (
                        <span className="ml-auto text-red-400 text-xs self-center flex-shrink-0 font-bold tracking-widest">
                          WRONG
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback explanation */}
              {drillState.phase === 'feedback' && (
                <div
                  className={[
                    'border p-5 space-y-3',
                    drillState.wasCorrect
                      ? 'border-green-500 bg-green-950/40'
                      : 'border-red-500 bg-red-950/40',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'font-bold text-sm tracking-widest uppercase',
                      drillState.wasCorrect ? 'text-green-400' : 'text-red-400',
                    ].join(' ')}
                  >
                    {drillState.wasCorrect ? 'Correct!' : 'Incorrect — back to the queue'}
                  </p>
                  {drillQuestion.explanation && (
                    <div>
                      <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">Explanation</p>
                      <p className="text-text text-sm leading-relaxed">{drillQuestion.explanation}</p>
                    </div>
                  )}
                  {drillQuestion.examTrap && (
                    <div>
                      <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">Exam Trap</p>
                      <p className="text-text text-sm leading-relaxed">{drillQuestion.examTrap}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drill action bar */}
            <div className="border-t border-border bg-bgElevated px-8 py-4 flex items-center gap-4 flex-shrink-0 sticky bottom-0">
              {drillState.phase === 'selecting' ? (
                <button
                  onClick={confirmDrillAnswer}
                  disabled={!drillState.selectedChoiceId}
                  className="bg-gold text-bg font-bold text-sm tracking-[0.2em] px-8 py-3 hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  CONFIRM
                </button>
              ) : (
                <button
                  onClick={advanceDrill}
                  className={[
                    'font-bold text-sm tracking-[0.2em] px-8 py-3 transition-opacity hover:opacity-90',
                    drillState.wasCorrect
                      ? 'bg-green-700 text-white'
                      : 'bg-bgElevated border border-border text-textMuted hover:border-textMuted',
                  ].join(' ')}
                >
                  NEXT →
                </button>
              )}
              <span className="text-textMuted text-xs">
                {drillState.phase === 'selecting' && !drillState.selectedChoiceId
                  ? 'Select an answer · A/B/C/D keys'
                  : drillState.phase === 'selecting'
                  ? 'Press Enter or Space to confirm'
                  : 'Press Enter or Space to continue'}
              </span>
              <span className="ml-auto text-textMuted text-xs">
                {drillState.queue.length - drillState.currentIndex} remaining
              </span>
            </div>
          </div>
        ) : (
          /* Question not found in bank */
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-2">
              <p className="text-textMuted text-sm">Question data not found.</p>
              <button
                onClick={advanceDrill}
                className="text-gold text-xs border border-gold px-4 py-2"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TWO-PANEL REVIEW ───────────────────────────────────────────────────────
  const entry = wrongAnswers[selectedIdx];
  const found = entry ? findQuestionById(entry.questionId) : undefined;
  const question = found?.question;
  const correctSet = question ? new Set(question.correctAnswers) : new Set<string>();

  // Group by domain for sidebar headers
  const byDomain = wrongAnswers.reduce((m, w, i) => {
    (m[w.domainId] ??= []).push(i);
    return m;
  }, {} as Record<string, number[]>);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-72 flex-shrink-0 border-r border-border bg-bgElevated flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
            <button
              onClick={enterDrill}
              className="px-3 py-1 border border-gold text-gold text-[10px] font-bold tracking-[0.2em] hover:bg-gold hover:text-bg transition-colors"
            >
              DRILL
            </button>
          </div>
          <p className="text-text font-semibold text-sm">Wrong Answer Review</p>
          <div className="mt-3 border border-danger px-3 py-2 flex items-center gap-3">
            <span className="text-danger font-bold text-2xl">{wrongAnswers.length}</span>
            <span className="text-textMuted text-[10px] tracking-[0.2em] uppercase leading-tight">
              questions<br />to review
            </span>
          </div>
        </div>

        {/* Cert switcher */}
        <div className="p-3 border-b border-border flex-shrink-0 flex flex-wrap gap-1.5">
          {certDisplayOrder.map((cid) => {
            const p = certPacks[cid]!;
            const isActive = cid === certId;
            return (
              <button
                key={cid}
                onClick={() => router.replace(`/practice/wrong-answers?certId=${cid}`)}
                className={[
                  'px-2 py-1 border text-[10px] font-bold tracking-widest transition-colors',
                  isActive
                    ? 'border-gold text-gold bg-bg'
                    : 'border-border text-textMuted hover:border-textMuted',
                ].join(' ')}
              >
                {p.meta.examCode}
              </button>
            );
          })}
        </div>

        {/* Question list grouped by domain */}
        <div className="overflow-y-auto flex-1">
          {Object.entries(byDomain).map(([domainId, indices]) => {
            const domain = pack.domains.find((d) => d.id === domainId);
            const region = lore.regions.find((r) => r.domainId === domainId);
            return (
              <div key={domainId}>
                <div className="px-4 py-2 bg-bg border-b border-border sticky top-0">
                  <p className="text-[9px] text-textMuted tracking-[0.25em] uppercase font-semibold">
                    {region?.regionName ?? domain?.title}
                  </p>
                </div>
                {indices.map((i) => {
                  const w = wrongAnswers[i]!;
                  const isSelected = i === selectedIdx;
                  return (
                    <button
                      key={w.questionId}
                      onClick={() => { setSelectedIdx(i); setRevealed(false); }}
                      className={[
                        'w-full text-left px-4 py-3 border-b border-border transition-colors',
                        isSelected
                          ? 'bg-bgCard border-l-2 border-l-gold'
                          : 'hover:bg-bgCard border-l-2 border-l-transparent',
                      ].join(' ')}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-text text-xs leading-snug line-clamp-2 flex-1">
                          {(() => {
                            const f = findQuestionById(w.questionId);
                            return f ? f.question.questionText.slice(0, 80) + '…' : w.questionId;
                          })()}
                        </p>
                        <span className="text-danger text-[10px] font-bold flex-shrink-0">
                          ×{w.timesWrong}
                        </span>
                      </div>
                      <p className="text-textMuted text-[10px] mt-1">
                        {new Date(w.lastMissedAt).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar footer nav */}
        <div className="flex border-t border-border flex-shrink-0">
          <button
            onClick={() => { setSelectedIdx((i) => Math.max(0, i - 1)); setRevealed(false); }}
            disabled={selectedIdx === 0}
            className="flex-1 py-3 text-xs text-textMuted border-r border-border disabled:opacity-30 hover:bg-bgCard transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => { setSelectedIdx((i) => Math.min(wrongAnswers.length - 1, i + 1)); setRevealed(false); }}
            disabled={selectedIdx === wrongAnswers.length - 1}
            className="flex-1 py-3 text-xs text-textMuted disabled:opacity-30 hover:bg-bgCard transition-colors"
          >
            Next →
          </button>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {entry && question ? (
          <>
            {/* Question header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-bgElevated flex-shrink-0">
              <div>
                <span className="text-danger text-xs font-semibold">
                  Missed {entry.timesWrong}×
                </span>
                <span className="text-textMuted text-xs mx-2">·</span>
                <span className="text-textMuted text-xs">
                  Last on {new Date(entry.lastMissedAt).toLocaleDateString()}
                </span>
              </div>
              <span className="text-textMuted text-xs">
                {selectedIdx + 1} / {wrongAnswers.length}
              </span>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Question + choices */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                <p className="font-serif text-text text-xl leading-relaxed">{question.questionText}</p>

                <div className="space-y-3 pt-2">
                  {question.choices.map((c) => {
                    const isCorrect = correctSet.has(c.id);
                    return (
                      <div
                        key={c.id}
                        className={[
                          'border p-4 flex gap-3 transition-colors',
                          revealed && isCorrect
                            ? 'border-gold bg-bg'
                            : 'border-border bg-bgElevated',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex-shrink-0 w-6 h-6 border flex items-center justify-center text-[10px] font-bold',
                            revealed && isCorrect
                              ? 'border-gold text-gold'
                              : 'border-border text-textMuted',
                          ].join(' ')}
                        >
                          {c.id.toUpperCase()}
                        </span>
                        <span
                          className={[
                            'text-sm leading-relaxed',
                            revealed && isCorrect ? 'text-gold font-semibold' : 'text-text',
                          ].join(' ')}
                        >
                          {c.text}
                        </span>
                        {revealed && isCorrect && (
                          <span className="ml-auto text-gold text-xs self-center flex-shrink-0 font-bold tracking-widest">
                            CORRECT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation (shown after reveal) */}
                {revealed && (
                  <div className="border border-gold bg-bgElevated p-5 space-y-3">
                    <div>
                      <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">Explanation</p>
                      <p className="text-text text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                    {question.examTrap && (
                      <div>
                        <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">Exam Trap</p>
                        <p className="text-text text-sm leading-relaxed">{question.examTrap}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action bar */}
            <div className="border-t border-border bg-bgElevated px-8 py-4 flex items-center gap-4 flex-shrink-0">
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="bg-gold text-bg font-bold text-sm tracking-[0.2em] px-8 py-3 hover:opacity-90 transition-opacity"
                >
                  SHOW ANSWER
                </button>
              ) : (
                <>
                  <button
                    onClick={() => markResolved(entry.questionId)}
                    className="border border-gold text-gold text-sm tracking-[0.15em] px-6 py-2.5 hover:bg-gold hover:text-bg transition-colors font-semibold"
                  >
                    MARK RESOLVED
                  </button>
                  <button
                    onClick={() => {
                      if (selectedIdx < wrongAnswers.length - 1) {
                        setSelectedIdx((i) => i + 1);
                        setRevealed(false);
                      }
                    }}
                    disabled={selectedIdx === wrongAnswers.length - 1}
                    className="border border-border text-textMuted text-sm px-6 py-2.5 disabled:opacity-30 hover:border-textMuted transition-colors"
                  >
                    Next →
                  </button>
                </>
              )}
              <span className="ml-auto text-textMuted text-xs">
                {selectedIdx + 1} / {wrongAnswers.length} · {wrongAnswers.length} unresolved
              </span>
            </div>
          </>
        ) : (
          /* Stale reference — question not found in bank */
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-textMuted text-sm">Question data not found.</p>
              <button
                onClick={() => setSelectedIdx((i) => Math.min(wrongAnswers.length - 1, i + 1))}
                className="text-gold text-xs border border-gold px-4 py-2"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
