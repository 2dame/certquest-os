'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { findSideQuestById, certPacks } from '@certquest/content';
import { useStore } from '@/lib/store';

type Phase = 'brief' | 'question' | 'feedback' | 'done';

const CHOICE_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;
const QUEST_Q_COUNT = 5;
const XP_PER_CORRECT = 15;
const XP_COMPLETION = 30;

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

const TEMPLATE_LABEL: Record<string, string> = {
  port_lockpick:         'Port Lockpick',
  osi_tower:             'OSI Tower',
  subnet_sprint:         'Subnet Sprint',
  cable_crafter:         'Cable Crafter',
  packet_detective:      'Packet Detective',
  cloud_architect:       'Cloud Architect',
  cli_dojo:              'CLI Dojo',
  troubleshoot_sequence: 'Troubleshoot Sequence',
};

export default function GamePage() {
  const { questId } = useParams<{ questId: string }>();
  const router = useRouter();

  const found = findSideQuestById(questId ?? '');
  const quest = found?.sideQuest;
  const pack = found?.pack;

  const addXp = useStore((s) => s.addXp);
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);

  // Pull questions related to the quest's objectiveId (or cert-wide if no objective)
  const questions = useMemo(() => {
    if (!pack || !quest) return [];
    const bank = quest.objectiveId
      ? pack.questionBank.filter((q) => q.objectiveId === quest.objectiveId)
      : pack.questionBank;
    return [...bank].sort(() => Math.random() - 0.5).slice(0, QUEST_Q_COUNT);
  }, [pack, quest]);

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
    const xp = correct ? XP_PER_CORRECT : 0;
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
      const correct = results.filter((r) => r.correct).length;
      addXp(XP_COMPLETION);
      setTotalXp((x) => x + XP_COMPLETION);
      if (quest && pack) {
        recordQuizAttempt({
          certId: quest.certId,
          attemptedAt: new Date().toISOString(),
          questionCount: questions.length,
          correctCount: correct,
          questions: results.map((r) => ({
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

  // Keyboard shortcuts
  useEffect(() => {
    if (phase === 'brief' || phase === 'done') return;
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

  if (!quest || !pack) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">Side quest not found.</p>
        <button onClick={() => router.back()} className="text-gold text-sm">← Back</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">No questions available for this quest yet.</p>
        <button onClick={() => router.back()} className="text-gold text-sm">← Back</button>
      </div>
    );
  }

  // ── BRIEF ──
  if (phase === 'brief') {
    const templateLabel = TEMPLATE_LABEL[quest.template] ?? quest.template;
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Side Quest · {templateLabel}</p>
          <h1 className="font-serif text-4xl leading-tight">{quest.title}</h1>
        </div>
        <div className="border border-gold/30 bg-bgCard p-6">
          <p className="text-gold text-[10px] tracking-widest uppercase mb-3">Mission Brief</p>
          <p className="text-text text-sm leading-relaxed">{quest.story}</p>
        </div>
        <div className="border border-border bg-bgElevated p-4 text-sm text-textMuted space-y-1">
          <p>· {questions.length} challenges · immediate feedback each round</p>
          <p>· +{XP_PER_CORRECT} XP per correct answer</p>
          <p>· +{XP_COMPLETION} XP completion bonus</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('question')}
            className="bg-gold text-bg font-bold tracking-[0.2em] text-sm px-8 py-3 hover:opacity-90 transition-opacity"
          >
            ACCEPT QUEST
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
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Quest Complete</p>
          <h1 className="font-serif text-4xl">{quest.title}</h1>
          <p className="text-textMuted text-sm mt-1">{correctCount}/{questions.length} correct · {totalXp} XP earned</p>
        </div>
        <div className="border border-gold/40 bg-bgCard p-6 text-center space-y-3">
          <div className="text-5xl font-bold font-mono text-gold">{pct}%</div>
          <p className="text-textMuted text-sm">
            {pct >= 80 ? 'Excellent work, recruit.' : pct >= 60 ? 'Solid effort. Review the misses.' : 'Tough quest. Keep drilling.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/dashboard')} className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-3 hover:opacity-90 transition-opacity">
            DASHBOARD →
          </button>
          <button
            onClick={() => { setIdx(0); setResults([]); setSelected([]); setTotalXp(0); setPhase('brief'); }}
            className="border border-border text-textMuted text-sm px-6 py-3 hover:border-gold transition-colors"
          >
            Replay
          </button>
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
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto w-full py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-gold text-[10px] tracking-widest uppercase">{quest.title}</span>
          <span className="text-gold font-bold tabular-nums">{idx + 1} / {questions.length}</span>
        </div>

        <div className="border border-border bg-bgCard p-6">
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
              cls = isSel ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-bgElevated text-text hover:border-gold/40 hover:bg-bgCard';
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
              {isCorrect ? `✓ CORRECT · +${XP_PER_CORRECT} XP` : '✗ INCORRECT'}
            </p>
            {q.explanation && <p className="text-text text-sm leading-relaxed">{q.explanation}</p>}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-textDim text-xs">
            <kbd className="font-mono border border-border px-1">A–D</kbd> · <kbd className="font-mono border border-border px-1">Enter</kbd>
          </p>
          {phase === 'question' ? (
            <button onClick={submitAnswer} disabled={selected.length === 0} className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-2.5 hover:opacity-90 disabled:opacity-30 transition-opacity">
              CONFIRM
            </button>
          ) : (
            <button onClick={advance} className="bg-gold text-bg font-bold tracking-widest text-sm px-6 py-2.5 hover:opacity-90 transition-opacity">
              {idx < questions.length - 1 ? 'NEXT →' : 'FINISH'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
