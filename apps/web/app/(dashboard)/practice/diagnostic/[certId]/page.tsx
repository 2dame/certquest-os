'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCertPack, getQuestionsForCert, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';

type Phase = 'intro' | 'taking' | 'done';

const TARGET_COUNT = 30;
const KEY_LABELS = ['a', 'b', 'c', 'd', 'e'] as const;

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

export default function DiagnosticPage() {
  const params = useParams();
  const certId = typeof params.certId === 'string' ? params.certId : Array.isArray(params.certId) ? params.certId[0] : '';
  const router = useRouter();

  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const recordDiagnostic = useStore((s) => s.recordDiagnostic);
  const readiness = useStore((s) => s.readinessByCert[certId ?? '']);

  const pack = getCertPack(certId ?? '');
  const lore = getCertLore(certId ?? '');

  const questions = useMemo(() => {
    if (!pack) return [];
    const all = getQuestionsForCert(certId ?? '');
    const picks: typeof all = [];
    for (const d of pack.domains) {
      const target = Math.max(1, Math.round((d.weight ?? 0) * TARGET_COUNT));
      const inDomain = all.filter((q) => q.domainId === d.id).sort(() => Math.random() - 0.5);
      picks.push(...inDomain.slice(0, target));
    }
    return picks.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);
  }, [certId, pack]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const q = questions[idx];
  const isMulti = q ? q.correctAnswers.length > 1 : false;
  const sel = q ? (answers[q.id] ?? []) : [];

  function toggle(choiceId: string) {
    if (!q) return;
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      const next = isMulti
        ? (cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId])
        : [choiceId];
      return { ...a, [q.id]: next };
    });
  }

  function advance() {
    if (idx < questions.length - 1) setIdx((i) => i + 1);
  }

  function goBack() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  function submit() {
    let correct = 0;
    const perQuestion = questions.map((qq) => {
      const got = answers[qq.id] ?? [];
      const ok = sameSet(got, qq.correctAnswers);
      if (ok) correct++;
      return {
        questionId: qq.id,
        isCorrect: ok,
        selected: got,
        objectiveId: qq.objectiveId,
        domainId: qq.domainId,
      };
    });
    recordQuizAttempt({
      certId: certId!,
      attemptedAt: new Date().toISOString(),
      questionCount: questions.length,
      correctCount: correct,
      questions: perQuestion,
    });
    const baseline = Math.round((correct / questions.length) * 100);
    recordDiagnostic(certId!, baseline);
    setPhase('done');
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'taking' || !q) return;
      const key = e.key.toLowerCase();
      const choiceIdx = KEY_LABELS.indexOf(key as typeof KEY_LABELS[number]);
      if (choiceIdx !== -1 && choiceIdx < q.choices.length) {
        toggle(q.choices[choiceIdx]!.id);
        return;
      }
      if (key === 'enter' || key === 'arrowright') {
        if (sel.length > 0) {
          if (idx < questions.length - 1) advance();
          else submit();
        }
        return;
      }
      if (key === 'arrowleft') {
        goBack();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, q, sel, idx, questions.length],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  if (!pack || !lore || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm">Diagnostic not available — content gap.</p>
      </div>
    );
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">
            {lore.worldName} · Diagnostic
          </p>
          <h1 className="font-serif text-4xl text-text">Pre-Exam Diagnostic</h1>
        </div>

        <p className="text-text text-sm leading-relaxed">
          {questions.length} questions across all domains. No timer. Answer honestly — guessing
          inflates the baseline and misleads your study plan.
        </p>

        <div className="border border-border bg-bgElevated p-5 space-y-2">
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-3">What This Does</p>
          <p className="text-text text-sm">· Establishes a baseline readiness score for {pack.meta.examCode}</p>
          <p className="text-text text-sm">· Surfaces your weakest domains immediately</p>
          <p className="text-text text-sm">· Logs misses to your wrong-answer queue</p>
          <p className="text-text text-sm">· Runs once — retake by resetting progress</p>
        </div>

        <div className="border border-border bg-bgElevated p-5 space-y-1">
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-3">Keyboard Shortcuts</p>
          <p className="text-textMuted text-xs">A / B / C / D — select answer choice</p>
          <p className="text-textMuted text-xs">Enter or → — advance to next question</p>
          <p className="text-textMuted text-xs">← — go back</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('taking')}
            className="bg-gold text-bg font-bold text-sm tracking-[0.2em] px-8 py-3 hover:opacity-90 transition-opacity"
          >
            BEGIN DIAGNOSTIC
          </button>
          <button
            onClick={() => router.back()}
            className="text-textMuted text-sm px-6 py-3 border border-border hover:border-textMuted transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  // ── TAKING ─────────────────────────────────────────────────────────────────
  if (phase === 'taking') {
    const progress = ((idx + 1) / questions.length) * 100;
    const isLast = idx === questions.length - 1;
    const canAdvance = sel.length > 0;

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Progress bar */}
        <div className="h-1 bg-bgElevated flex-shrink-0">
          <div
            className="h-1 bg-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bgElevated flex-shrink-0">
          <span className="text-text text-xs font-semibold tracking-widest uppercase">Diagnostic</span>
          <span className="text-gold text-xs font-bold">
            {idx + 1} / {questions.length}
          </span>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: question */}
          <div className="flex-1 overflow-y-auto border-r border-border p-8">
            <p className="text-[10px] text-textMuted tracking-[0.3em] uppercase mb-4">
              {isMulti ? 'Choose all that apply' : 'Choose one'}
            </p>
            <p className="text-text text-lg leading-relaxed font-serif">{q!.questionText}</p>
          </div>

          {/* Right: choices */}
          <div className="w-[480px] flex-shrink-0 overflow-y-auto p-6 space-y-3">
            {q!.choices.map((c, ci) => {
              const checked = sel.includes(c.id);
              const label = KEY_LABELS[ci] ?? c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={[
                    'w-full text-left border p-4 transition-all flex gap-3 group',
                    checked
                      ? 'border-gold bg-bg text-gold'
                      : 'border-border bg-bgElevated text-text hover:border-textMuted',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex-shrink-0 w-6 h-6 border flex items-center justify-center text-[10px] font-bold tracking-widest uppercase transition-colors',
                      checked ? 'border-gold text-gold' : 'border-border text-textMuted group-hover:border-textMuted',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                  <span className="text-sm leading-relaxed">{c.text}</span>
                </button>
              );
            })}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={goBack}
                disabled={idx === 0}
                className="flex-1 py-3 border border-border text-sm text-textMuted disabled:opacity-30 hover:border-textMuted transition-colors"
              >
                ← Back
              </button>
              {isLast ? (
                <button
                  onClick={submit}
                  disabled={!canAdvance}
                  className="flex-1 py-3 bg-gold text-bg font-bold text-sm tracking-[0.15em] disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  SUBMIT
                </button>
              ) : (
                <button
                  onClick={advance}
                  disabled={!canAdvance}
                  className="flex-1 py-3 border border-border text-sm text-text disabled:opacity-30 hover:border-textMuted transition-colors"
                >
                  Next →
                </button>
              )}
            </div>

            {/* Answered indicator */}
            <div className="pt-2">
              <p className="text-[10px] text-textMuted tracking-widest text-center">
                {Object.keys(answers).length} / {questions.length} answered
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  let correct = 0;
  questions.forEach((qq) => {
    if (sameSet(answers[qq.id] ?? [], qq.correctAnswers)) correct++;
  });
  const baseline = Math.round((correct / questions.length) * 100);
  const overall = readiness?.overall ?? baseline;
  const weakDomains =
    readiness?.domains
      .filter((d: { domainId: string; score: number }) => d.score < 65)
      .slice(0, 3) ?? [];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div>
        <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Baseline Established</p>
        <h1 className="font-serif text-4xl text-text">
          {baseline}% raw &middot; {overall}% calibrated
        </h1>
      </div>

      <p className="text-text text-sm leading-relaxed">
        You answered {correct}/{questions.length} correctly. Your readiness score blends raw
        performance with mastery, recency, and confidence — the calibrated number is what unlocks
        practice exam trials.
      </p>

      {/* Score bar */}
      <div className="border border-border bg-bgElevated p-5 space-y-3">
        <div className="flex justify-between text-xs text-textMuted mb-1">
          <span>Raw score</span>
          <span className="text-gold font-bold">{baseline}%</span>
        </div>
        <div className="h-2 bg-bg">
          <div className="h-2 bg-gold transition-all" style={{ width: `${baseline}%` }} />
        </div>
        <div className="flex justify-between text-xs text-textMuted mb-1">
          <span>Calibrated readiness</span>
          <span className="text-gold font-bold">{overall}%</span>
        </div>
        <div className="h-2 bg-bg">
          <div className="h-2 bg-gold transition-all" style={{ width: `${overall}%` }} />
        </div>
      </div>

      {/* Weak domains */}
      {weakDomains.length > 0 && (
        <div className="border border-border bg-bgElevated p-5">
          <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-4">Weak Domains</p>
          <div className="space-y-3">
            {weakDomains.map((d: { domainId: string; score: number }) => {
              const domain = pack.domains.find((x) => x.id === d.domainId);
              const region = lore.regions.find((r) => r.domainId === d.domainId);
              return (
                <div key={d.domainId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text font-semibold">
                      {region?.regionName ?? domain?.title}
                    </span>
                    <span className="text-danger font-bold">{d.score}%</span>
                  </div>
                  <div className="h-1 bg-bg">
                    <div className="h-1 bg-danger" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="border border-border bg-bgElevated p-5 space-y-2">
        <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-3">Next Steps</p>
        <p className="text-text text-sm">· Today's plan now reflects your weak areas</p>
        <p className="text-text text-sm">· Wrong-answer queue logged your misses for review</p>
        <p className="text-text text-sm">· Practice exam unlocks at 80% readiness + boss battles passed</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gold text-bg font-bold text-sm tracking-[0.2em] px-8 py-3 hover:opacity-90 transition-opacity"
        >
          BEGIN TRAINING
        </button>
        <button
          onClick={() => router.push(`/practice/wrong-answers?certId=${certId}`)}
          className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors"
        >
          Review Wrong Answers
        </button>
      </div>
    </div>
  );
}
