'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { findLessonById, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';

const BLOCK_STYLE: Record<string, { border: string; bg: string; label?: string; labelColor?: string; textSize?: string }> = {
  intro:                  { border: 'border-border',    bg: 'bg-bgElevated',     textSize: 'text-lg' },
  concept:                { border: 'border-border',    bg: 'bg-bgCard' },
  analogy:                { border: 'border-gold/40',   bg: 'bg-bgCard',         label: 'ANALOGY',       labelColor: 'text-gold' },
  why_it_matters:         { border: 'border-gold/60',   bg: 'bg-gold/5',         label: 'WHY IT MATTERS', labelColor: 'text-gold' },
  exam_angle:             { border: 'border-gold',      bg: 'bg-gold/10',        label: 'EXAM ANGLE',    labelColor: 'text-gold' },
  trap:                   { border: 'border-red-700',   bg: 'bg-red-950/40',     label: 'EXAM TRAP',     labelColor: 'text-red-400' },
  common_mistake:         { border: 'border-red-800',   bg: 'bg-red-950/30',     label: 'COMMON MISTAKE', labelColor: 'text-red-400' },
  memory_hook:            { border: 'border-purple-600/50', bg: 'bg-purple-950/30', label: 'MEMORY HOOK', labelColor: 'text-purple-400' },
  check_for_understanding:{ border: 'border-gold/50',   bg: 'bg-bgElevated',     label: 'CHECK',         labelColor: 'text-gold' },
  mastery_challenge:      { border: 'border-gold',      bg: 'bg-bgCard',         label: 'CHALLENGE',     labelColor: 'text-gold' },
  summary:                { border: 'border-border',    bg: 'bg-bgElevated',     label: 'SUMMARY',       labelColor: 'text-textMuted' },
  port_protocol:          { border: 'border-border',    bg: 'bg-bgCard',         label: 'PORTS',         labelColor: 'text-gold' },
  decision_table:         { border: 'border-border',    bg: 'bg-bgCard',         label: 'REFERENCE',     labelColor: 'text-textMuted' },
  scenario:               { border: 'border-gold/30',   bg: 'bg-bgElevated',     label: 'SCENARIO',      labelColor: 'text-gold' },
  beginner_explanation:   { border: 'border-border',    bg: 'bg-bgCard',         label: 'BASICS',        labelColor: 'text-textMuted' },
  technical:              { border: 'border-border',    bg: 'bg-bgCard',         label: 'TECHNICAL',     labelColor: 'text-textMuted' },
};

const XP_LESSON = 50;

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const found = findLessonById(lessonId ?? '');
  const lesson = found?.lesson;
  const pack = found?.pack;
  const lore = lesson ? getCertLore(lesson.certId) : undefined;

  const completedLessons = useStore((s) => s.completedLessons);
  const recordLessonComplete = useStore((s) => s.completeLesson);
  const addXp = useStore((s) => s.addXp);

  const alreadyDone = completedLessons.some((c) => c.lessonId === lessonId);
  const [completed, setCompleted] = useState(false);
  const [xpShown, setXpShown] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);

  const finish = useCallback(() => {
    if (completed || alreadyDone) return;
    if (lesson) {
      recordLessonComplete({ certId: lesson.certId, lessonId: lesson.id, objectiveId: lesson.objectiveId, completedAt: new Date().toISOString() });
      addXp(XP_LESSON);
      setXpShown(true);
      setTimeout(() => setXpShown(false), 3000);
    }
    setCompleted(true);
  }, [completed, alreadyDone, lesson, recordLessonComplete, addXp]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lesson) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setActiveBlock((i) => Math.min(lesson.blocks.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setActiveBlock((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lesson]);

  if (!lesson || !pack) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">Lesson not found.</p>
        <Link href="/dashboard" className="text-gold text-sm">← Back to Dashboard</Link>
      </div>
    );
  }

  const mentor = lore?.mentor;
  const objective = pack.objectives.find((o) => o.id === lesson.objectiveId);
  const domain = objective ? pack.domains.find((d) => d.id === objective.domainId) : undefined;
  const progress = ((activeBlock + 1) / lesson.blocks.length) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Progress bar */}
      <div className="h-0.5 bg-border fixed top-0 left-[260px] right-0 z-10">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* XP toast */}
      {xpShown && (
        <div className="fixed top-6 right-6 z-50 bg-gold text-bg font-bold px-4 py-2 text-sm tracking-widest animate-bounce shadow-lg">
          +{XP_LESSON} XP
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full py-10 px-4 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="text-textMuted text-xs hover:text-text transition-colors">← Back</button>
            {domain && <span className="text-textMuted text-[10px] tracking-widest uppercase">{domain.title}</span>}
            <span className="text-textDim text-[10px]">·</span>
            <span className="text-textMuted text-[10px]">{lesson.estimatedMinutes} min</span>
          </div>
          <h1 className="font-serif text-4xl text-text leading-tight">{lesson.title}</h1>
          {objective && <p className="text-textMuted text-sm mt-1">{objective.title}</p>}
        </div>

        {/* Lore intro */}
        {lesson.loreIntro && (
          <div className="border border-gold/30 bg-bgCard p-5 space-y-3">
            {mentor && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <p className="text-gold text-[10px] tracking-[0.3em] uppercase">{mentor.name} — {mentor.title}</p>
              </div>
            )}
            <p className="text-textMuted text-xs italic">{lesson.loreIntro.scene}</p>
            <p className="text-text text-sm leading-relaxed">"{lesson.loreIntro.mentorMessage}"</p>
            <div className="border-t border-border/50 pt-3">
              <p className="text-gold text-[10px] tracking-widest uppercase mb-1">Mission</p>
              <p className="text-textMuted text-xs">{lesson.loreIntro.missionObjective}</p>
            </div>
          </div>
        )}

        {/* Blocks */}
        <div className="space-y-4">
          {lesson.blocks.map((block, i) => {
            const style = BLOCK_STYLE[block.kind] ?? BLOCK_STYLE.concept!;
            const isActive = i === activeBlock;
            const isPast = i < activeBlock;

            return (
              <button
                key={i}
                onClick={() => setActiveBlock(i)}
                className={[
                  'w-full text-left border p-5 transition-all duration-200',
                  style.border,
                  style.bg,
                  isActive ? 'ring-1 ring-gold/40 scale-[1.01]' : '',
                  isPast ? 'opacity-70' : '',
                ].join(' ')}
              >
                {style.label && (
                  <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 font-semibold ${style.labelColor ?? 'text-textMuted'}`}>
                    {style.label}
                  </p>
                )}
                <p className={`text-text leading-relaxed whitespace-pre-line ${style.textSize ?? 'text-sm'}`}>
                  {block.body}
                </p>
              </button>
            );
          })}
        </div>

        {/* Navigation between blocks */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveBlock((i) => Math.max(0, i - 1))}
            disabled={activeBlock === 0}
            className="text-textMuted text-sm px-4 py-2 border border-border hover:border-textMuted disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-textDim text-xs">{activeBlock + 1} / {lesson.blocks.length}</span>
          {activeBlock < lesson.blocks.length - 1 ? (
            <button
              onClick={() => setActiveBlock((i) => Math.min(lesson.blocks.length - 1, i + 1))}
              className="text-text text-sm px-4 py-2 border border-border hover:border-textMuted transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={completed || alreadyDone}
              className="bg-gold text-bg font-bold text-sm tracking-widest px-6 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {completed || alreadyDone ? '✓ COMPLETED' : 'MARK COMPLETE'}
            </button>
          )}
        </div>

        {/* After completion CTA */}
        {(completed || alreadyDone) && (
          <div className="border border-gold/30 bg-bgCard p-5 space-y-3 text-center">
            <p className="text-gold font-semibold">Lesson Complete{alreadyDone && !completed ? ' — Already done' : ''}</p>
            {completed && !alreadyDone && (
              <p className="text-textMuted text-xs">+{XP_LESSON} XP awarded</p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/dashboard" className="bg-gold text-bg font-bold text-sm tracking-widest px-6 py-2 hover:opacity-90 transition-opacity">
                TODAY'S PLAN →
              </Link>
              <Link href={`/review/${lesson.certId}`} className="border border-border text-textMuted text-sm px-6 py-2 hover:border-gold transition-colors">
                Flashcard Review
              </Link>
            </div>
          </div>
        )}

        {/* Keyboard hint */}
        <p className="text-textDim text-[10px] text-center pb-4">
          <kbd className="font-mono border border-border px-1">↑↓</kbd> navigate blocks
        </p>
      </div>
    </div>
  );
}
