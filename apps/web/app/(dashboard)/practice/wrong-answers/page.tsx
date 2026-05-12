'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { certPacks, certDisplayOrder, findQuestionById, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';

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

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Reset view when cert or list changes
  useEffect(() => {
    setSelectedIdx(0);
    setRevealed(false);
  }, [certId]);

  function markResolved(questionId: string) {
    if (!pack) return;
    // Record a correct answer to flip the resolved flag via recordQuizAttempt
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
    // Advance to next if available, otherwise stay
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
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-1">{lore.worldName}</p>
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
