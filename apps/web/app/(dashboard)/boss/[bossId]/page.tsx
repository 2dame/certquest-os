'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { findBossBattleById } from '@certquest/content';
import { useStore } from '@/lib/store';

type Phase = 'brief' | 'question' | 'feedback' | 'result';

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;
const XP_CORRECT = 20;
const XP_PASS = 75;
const XP_FAIL = 15;

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export default function BossPage() {
  const { bossId } = useParams<{ bossId: string }>();
  const router = useRouter();

  const found = findBossBattleById(bossId ?? '');
  const boss = found?.bossBattle;
  const pack = found?.pack;

  const addXp = useStore((s) => s.addXp);
  const recordBossBattleAttempt = useStore((s) => s.recordBossBattleAttempt);
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);

  // Pull questions tied to the boss's objectiveIds, aim for ~12 questions
  const questions = useMemo(() => {
    if (!pack || !boss) return [];
    const fromObjectives = pack.questionBank.filter((q) =>
      boss.objectiveIds.includes(q.objectiveId ?? '')
    );
    const fallback = fromObjectives.length < 5 ? pack.questionBank : fromObjectives;
    return [...fallback].sort(() => Math.random() - 0.5).slice(0, 12);
  }, [pack, boss]);

  const [phase, setPhase] = useState<Phase>('brief');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<{ qId: string; correct: boolean; selected: string[]; domainId: string; objectiveId: string }[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  const q = questions[idx];
  const isMulti = q ? q.correctAnswers.length > 1 : false;
  const correctSet = useMemo(() => new Set(q?.correctAnswers ?? []), [q]);

  function toggle(choiceId: string) {
    setSelected((prev) =>
      isMulti
        ? prev.includes(choiceId) ? prev.filter((x) => x !== choiceId) : [...prev, choiceId]
        : [choiceId]
    );
  }

  const submitAnswer = useCallback(() => {
    if (!q || selected.length === 0) return;
    const correct = sameSet(selected, q.correctAnswers);
    const xp = correct ? XP_CORRECT : 0;
    setResults((r) => [...r, { qId: q.id, correct, selected, domainId: q.domainId, objectiveId: q.objectiveId ?? '' }]);
    if (correct) { addXp(xp); setTotalXp((x) => x + xp); }
    setPhase('feedback');
  }, [q, selected, addXp]);

  function advance() {
    setSelected([]);
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
      setPhase('question');
    } else {
      const correctCount = results.filter((r) => r.correct).length;
      const pct = Math.round((correctCount / questions.length) * 100);
      const passed = pct >= (boss?.rubric.passThreshold ?? 75);
      const xp = passed ? XP_PASS : XP_FAIL;
      addXp(xp);
      setTotalXp((x) => x + xp);
      if (boss) {
        recordBossBattleAttempt({
          bossId: boss.id,
          certId: boss.certId,
          objectiveIds: boss.objectiveIds,
          passed,
          score: pct,
          attemptedAt: new Date().toISOString(),
        });
        recordQuizAttempt({
          certId: boss.certId,
          attemptedAt: new Date().toISOString(),
          questionCount: questions.length,
          correctCount,
          questions: results.map((r) => ({
            questionId: r.qId,
            isCorrect: r.correct,
            selected: r.selected,
            objectiveId: r.objectiveId,
            domainId: r.domainId,
          })),
        });
      }
      setPhase('result');
    }
  }

  // Keyboard
  useEffect(() => {
    if (phase === 'brief' || phase === 'result') return;
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

  if (!boss || !pack) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">Boss battle not found.</p>
        <button onClick={() => router.back()} className="text-gold text-sm">← Back</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">No questions available for this boss yet.</p>
        <button onClick={() => router.back()} className="text-gold text-sm">← Back</button>
      </div>
    );
  }

  // ── BRIEF ──
  if (phase === 'brief') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-oxblood text-[10px] tracking-[0.3em] uppercase mb-1 font-semibold">⚔ BOSS BATTLE</p>
          <h1 className="font-serif text-4xl leading-tight text-text">{boss.title}</h1>
        </div>

        <div className="border border-red-900 bg-red-950/20 p-6 space-y-4">
          <p className="text-red-300 text-[10px] tracking-widest uppercase font-semibold">Situation</p>
          <p className="text-text text-sm leading-relaxed">{boss.storySetup}</p>
          {boss.scenario && (
            <div className="border-t border-red-900/60 pt-4">
              <p className="text-red-300 text-[10px] tracking-widest uppercase font-semibold mb-2">Scenario</p>
              <p className="text-text text-sm leading-relaxed">{boss.scenario}</p>
            </div>
          )}
        </div>

        {boss.constraints && boss.constraints.length > 0 && (
          <div className="border border-border bg-bgCard p-5">
            <p className="text-gold text-[10px] tracking-widest uppercase mb-3">Constraints</p>
            <div className="space-y-1">
              {boss.constraints.map((c, i) => (
                <p key={i} className="text-text text-sm">· {c}</p>
              ))}
            </div>
          </div>
        )}

        <div className="border border-border bg-bgElevated p-4 text-sm text-textMuted space-y-1">
          <p>· {questions.length} challenge questions · pass threshold: {boss.rubric.passThreshold}%</p>
          <p>· +{XP_CORRECT} XP per correct answer</p>
          <p>· +{XP_PASS} XP for passing · +{XP_FAIL} XP for attempting</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('question')}
            className="bg-red-700 text-white font-bold tracking-[0.2em] text-sm px-8 py-3 hover:bg-red-600 transition-colors"
          >
            ENGAGE
          </button>
          <button onClick={() => router.back()} className="border border-border text-textMuted text-sm px-6 py-3 hover:border-textMuted transition-colors">
            Retreat
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === 'result') {
    const correctCount = results.filter((r) => r.correct).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const passed = pct >= boss.rubric.passThreshold;

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className={`text-[10px] tracking-[0.3em] uppercase mb-1 font-semibold ${passed ? 'text-gold' : 'text-red-400'}`}>
            {passed ? '⚔ BOSS DEFEATED' : '⚔ BOSS HOLDS'}
          </p>
          <h1 className="font-serif text-4xl">{boss.title}</h1>
          <p className="text-textMuted text-sm mt-1">{correctCount}/{questions.length} correct · {totalXp} XP earned</p>
        </div>

        <div className={`border p-8 text-center space-y-4 ${passed ? 'border-gold/50 bg-gold/5' : 'border-red-800 bg-red-950/20'}`}>
          <div className={`font-mono text-6xl font-bold ${passed ? 'text-gold' : 'text-red-400'}`}>{pct}%</div>
          <div className={`text-sm font-bold tracking-[0.2em] uppercase px-4 py-1.5 inline-block ${passed ? 'bg-gold text-bg' : 'bg-red-900/60 text-red-300 border border-red-700'}`}>
            {passed ? 'PASS' : `FAIL · need ${boss.rubric.passThreshold}%`}
          </div>
          <p className="text-textMuted text-sm">
            {passed
              ? 'The threat is neutralized. Your mastery record has been updated.'
              : 'The boss is still standing. Study the weak areas and challenge again.'}
          </p>
        </div>

        {/* Rubric dimensions */}
        {boss.rubric.dimensions.length > 0 && (
          <div className="border border-border bg-bgCard p-5">
            <p className="text-textMuted text-[10px] tracking-widest uppercase mb-4">Evaluation Rubric</p>
            <div className="space-y-2">
              {boss.rubric.dimensions.map((d) => (
                <div key={d.key} className="flex items-start gap-3">
                  <span className="text-gold text-xs font-semibold w-24 shrink-0 uppercase">{d.key}</span>
                  <span className="text-textMuted text-xs leading-relaxed">{d.description}</span>
                  <span className="text-textDim text-xs shrink-0">{Math.round(d.weight * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => router.push('/dashboard')} className={`font-bold tracking-widest text-sm px-6 py-3 hover:opacity-90 transition-opacity ${passed ? 'bg-gold text-bg' : 'bg-red-700 text-white'}`}>
            DASHBOARD →
          </button>
          {!passed && (
            <button
              onClick={() => { setIdx(0); setResults([]); setSelected([]); setTotalXp(0); setPhase('brief'); }}
              className="border border-border text-textMuted text-sm px-6 py-3 hover:border-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── QUESTION / FEEDBACK ──
  if (!q) return null;
  const isCorrect = sameSet(selected, q.correctAnswers);
  const progress = ((idx + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="h-0.5 bg-border">
        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-red-400 text-[10px] tracking-widest uppercase font-semibold">⚔ {boss.title}</span>
          <span className="text-red-400 font-bold tabular-nums">{idx + 1} / {questions.length}</span>
        </div>

        <div className="border border-red-900/50 bg-bgCard p-6">
          {isMulti && <p className="text-gold text-[10px] tracking-widest uppercase mb-3">Choose all that apply</p>}
          <p className="text-text text-lg leading-relaxed font-serif">{q.questionText}</p>
        </div>

        <div className="space-y-2">
          {q.choices.map((c, ci) => {
            const isSel = selected.includes(c.id);
            const isFeedback = phase === 'feedback';
            const isRight = correctSet.has(c.id);
            let cls = '';
            if (!isFeedback) {
              cls = isSel ? 'border-red-500 bg-red-950/20 text-red-300' : 'border-border bg-bgElevated text-text hover:border-red-800/60 hover:bg-bgCard';
            } else {
              if (isRight && isSel) cls = 'border-green-500 bg-green-950/40 text-green-300';
              else if (isRight) cls = 'border-green-600 bg-green-950/20 text-green-400';
              else if (isSel) cls = 'border-red-500 bg-red-950/40 text-red-300 line-through';
              else cls = 'border-border/40 bg-bgElevated text-textDim opacity-60';
            }
            return (
              <button
                key={c.id}
                disabled={isFeedback}
                onClick={() => !isFeedback && toggle(c.id)}
                className={`w-full text-left flex items-start gap-3 border px-4 py-3 transition-all ${cls}`}
              >
                <span className="font-mono text-sm mt-0.5 shrink-0 w-5">{CHOICE_KEYS[ci]?.toUpperCase()}.</span>
                <span className="text-sm leading-relaxed flex-1">{c.text}</span>
                {isFeedback && isRight && <span className="text-green-400 text-xs font-bold shrink-0">✓</span>}
                {isFeedback && !isRight && isSel && <span className="text-red-400 text-xs font-bold shrink-0">✗</span>}
              </button>
            );
          })}
        </div>

        {phase === 'feedback' && (
          <div className={`border p-5 space-y-2 ${isCorrect ? 'border-green-700 bg-green-950/30' : 'border-red-800 bg-red-950/20'}`}>
            <p className={`text-sm font-bold tracking-widest ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? `✓ CORRECT · +${XP_CORRECT} XP` : '✗ INCORRECT'}
            </p>
            {q.explanation && <p className="text-text text-sm leading-relaxed">{q.explanation}</p>}
            {q.examTrap && (
              <div className="border-t border-border/50 pt-2">
                <p className="text-gold text-[10px] tracking-widest uppercase mb-1">Exam Trap</p>
                <p className="text-textMuted text-sm">{q.examTrap}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-textDim text-xs">
            <kbd className="font-mono border border-border px-1">A–D</kbd> · <kbd className="font-mono border border-border px-1">Enter</kbd>
          </p>
          {phase === 'question' ? (
            <button onClick={submitAnswer} disabled={selected.length === 0} className="bg-red-700 text-white font-bold tracking-widest text-sm px-6 py-2.5 hover:bg-red-600 disabled:opacity-30 transition-colors">
              CONFIRM
            </button>
          ) : (
            <button onClick={advance} className="bg-red-700 text-white font-bold tracking-widest text-sm px-6 py-2.5 hover:bg-red-600 transition-colors">
              {idx < questions.length - 1 ? 'NEXT →' : 'FINISH'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
