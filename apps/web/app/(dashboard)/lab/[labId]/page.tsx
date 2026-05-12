'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { allProofLabs } from '@certquest/content';
import { useStore } from '@/lib/store';
import type { ProofLab, LabTask } from '@certquest/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findLab(labId: string): ProofLab | undefined {
  return allProofLabs.find((l) => l.id === labId);
}

/** Fuzzy / case-insensitive match: user answer contains expected (after normalising) */
function fuzzyMatch(userAnswer: string, expected: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const u = norm(userAnswer);
  const e = norm(expected);
  // exact, or user answer contains the expected string, or expected contains user answer
  return u === e || u.includes(e) || e.includes(u);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type Screen = 'setup' | 'lab' | 'complete';

interface DifficultyBadgeProps { difficulty: ProofLab['difficulty']; }
function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const colors: Record<ProofLab['difficulty'], string> = {
    beginner: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    intermediate: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    advanced: 'text-red-400 border-red-400/30 bg-red-400/10',
  };
  return (
    <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded border ${colors[difficulty]}`}>
      {difficulty.toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Task state tracking
// ---------------------------------------------------------------------------
interface TaskState {
  completed: boolean;
  userAnswer: string;
  failedAttempts: number;
  feedback: 'none' | 'correct' | 'wrong' | 'unlocked';
}

function initialTaskStates(tasks: LabTask[]): TaskState[] {
  return tasks.map(() => ({ completed: false, userAnswer: '', failedAttempts: 0, feedback: 'none' }));
}

// ---------------------------------------------------------------------------
// Setup Screen
// ---------------------------------------------------------------------------
interface SetupScreenProps {
  lab: ProofLab;
  onBegin: () => void;
}

function SetupScreen({ lab, onBegin }: SetupScreenProps) {
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B10] text-[#F5F1E6] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={lab.difficulty} />
            <span className="text-[#6B6878] text-xs font-mono">{lab.estimatedMinutes} min · {lab.xpReward} XP</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6]">{lab.title}</h1>
        </div>

        {/* Lore narration */}
        <blockquote className="border-l-4 border-[#E5C97B] pl-4 bg-[#15151D] rounded-r-lg p-4 text-[#A8A2B2] italic text-sm leading-relaxed">
          {lab.loreNarration}
        </blockquote>

        {/* Tools */}
        <div className="bg-[#15151D] rounded-lg p-4 border border-[#2A2A38] space-y-3">
          <h2 className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Required Tools</h2>
          <ul className="space-y-2">
            {lab.tools.map((tool) => (
              <li key={tool.name} className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="text-[#E5C97B] font-mono text-sm">→</span>
                  {tool.url ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F5F1E6] text-sm underline underline-offset-2 hover:text-[#E5C97B] transition-colors"
                    >
                      {tool.name}
                    </a>
                  ) : (
                    <span className="text-[#F5F1E6] text-sm">{tool.name}</span>
                  )}
                </span>
                {tool.notes && (
                  <span className="ml-5 text-[#6B6878] text-xs">{tool.notes}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Learning objectives */}
        <div className="bg-[#15151D] rounded-lg p-4 border border-[#2A2A38] space-y-3">
          <h2 className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Learning Objectives</h2>
          <ul className="space-y-1.5">
            {lab.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#A8A2B2]">
                <span className="text-[#6B6878] font-mono mt-0.5">[ ]</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Setup — collapsible */}
        <div className="bg-[#15151D] rounded-lg border border-[#2A2A38] overflow-hidden">
          <button
            onClick={() => setSetupOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#1B1B26] transition-colors"
          >
            <span className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Environment Setup</span>
            <span className="text-[#6B6878] font-mono text-xs">{setupOpen ? '▲ collapse' : '▼ expand'}</span>
          </button>
          {setupOpen && (
            <div className="px-4 pb-4">
              <p className="text-[#A8A2B2] text-sm leading-relaxed whitespace-pre-wrap">{lab.setup}</p>
            </div>
          )}
        </div>

        {/* Begin */}
        <button
          onClick={onBegin}
          className="w-full py-3 rounded-lg bg-[#E5C97B] text-[#0B0B10] font-bold font-mono text-sm tracking-wider hover:brightness-110 active:scale-[0.98] transition-all"
        >
          BEGIN LAB
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Panel
// ---------------------------------------------------------------------------
interface TaskPanelProps {
  task: LabTask;
  taskIndex: number;
  totalTasks: number;
  state: TaskState;
  onAnswerChange: (val: string) => void;
  onCheckAnswer: () => void;
  onMarkDone: () => void;
  onNext: () => void;
  isLast: boolean;
}

function TaskPanel({
  task,
  taskIndex,
  totalTasks,
  state,
  onAnswerChange,
  onCheckAnswer,
  onMarkDone,
  onNext,
  isLast,
}: TaskPanelProps) {
  const [hintVisible, setHintVisible] = useState(false);

  const kind = task.verificationKind;
  const isOutputMatch = kind === 'output_match' || kind === 'calculation';
  const needsUserInput = !state.completed;

  // When can the user proceed?
  const canProceed = state.completed || state.feedback === 'unlocked';

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Task header */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-[#6B6878]">TASK {taskIndex + 1} / {totalTasks}</span>
        {state.completed && (
          <span className="font-mono text-xs text-emerald-400">✓ COMPLETE</span>
        )}
      </div>

      {/* Prompt */}
      <div className={`bg-[#15151D] rounded-lg p-5 border border-[#2A2A38] ${isOutputMatch ? 'font-mono' : ''}`}>
        <p className="text-[#F5F1E6] text-sm leading-relaxed whitespace-pre-wrap">{task.prompt}</p>
      </div>

      {/* Input area */}
      {!state.completed && (
        <div className="space-y-3">
          {isOutputMatch ? (
            <input
              type="text"
              value={state.userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-[#1B1B26] border border-[#2A2A38] rounded-lg px-4 py-3 text-[#F5F1E6] font-mono text-sm placeholder-[#6B6878] focus:outline-none focus:border-[#E5C97B] transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter') onCheckAnswer(); }}
            />
          ) : (
            <textarea
              value={state.userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={
                kind === 'screenshot'
                  ? 'Describe your screenshot or paste relevant details here...'
                  : 'Write your response here...'
              }
              rows={6}
              className="w-full bg-[#1B1B26] border border-[#2A2A38] rounded-lg px-4 py-3 text-[#F5F1E6] text-sm placeholder-[#6B6878] focus:outline-none focus:border-[#E5C97B] transition-colors resize-y"
            />
          )}
        </div>
      )}

      {/* Feedback */}
      {state.feedback !== 'none' && (
        <div
          className={`rounded-lg p-4 border font-mono text-sm ${
            state.feedback === 'correct'
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              : state.feedback === 'wrong'
              ? 'bg-red-400/10 border-red-400/30 text-red-400'
              : 'bg-amber-400/10 border-amber-400/30 text-amber-400'
          }`}
        >
          {state.feedback === 'correct' && '✓ Correct! Well done.'}
          {state.feedback === 'wrong' && `✗ Not quite. ${state.failedAttempts < 3 ? `${3 - state.failedAttempts} attempt${3 - state.failedAttempts === 1 ? '' : 's'} remaining before unlock.` : ''}`}
          {state.feedback === 'unlocked' && '→ Unlocked after attempts. Review the expected answer and continue.'}
        </div>
      )}

      {/* Hint */}
      {task.hint && (
        <div>
          <button
            onClick={() => setHintVisible((v) => !v)}
            className="text-xs font-mono text-[#6B6878] hover:text-[#A8A2B2] transition-colors"
          >
            {hintVisible ? '▲ hide hint' : '▼ show hint'}
          </button>
          {hintVisible && (
            <div className="mt-2 bg-[#15151D] border border-[#2A2A38] rounded-lg px-4 py-3 text-[#A8A2B2] text-sm italic">
              {task.hint}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto">
        {!state.completed && isOutputMatch && (
          <button
            onClick={onCheckAnswer}
            disabled={!state.userAnswer.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#E5C97B] text-[#0B0B10] font-bold font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all"
          >
            CHECK ANSWER
          </button>
        )}
        {!state.completed && !isOutputMatch && needsUserInput && (
          <button
            onClick={onMarkDone}
            className="px-5 py-2.5 rounded-lg bg-[#E5C97B] text-[#0B0B10] font-bold font-mono text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            MARK DONE
          </button>
        )}
        {canProceed && (
          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-lg border border-[#E5C97B] text-[#E5C97B] font-bold font-mono text-sm hover:bg-[#E5C97B]/10 active:scale-[0.98] transition-all"
          >
            {isLast ? 'FINISH LAB →' : 'NEXT TASK →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Complete Screen
// ---------------------------------------------------------------------------
interface CompleteScreenProps {
  lab: ProofLab;
  xpEarned: number;
}

function CompleteScreen({ lab, xpEarned }: CompleteScreenProps) {
  return (
    <div className="min-h-screen bg-[#0B0B10] text-[#F5F1E6] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-2">
          <div className="text-5xl font-mono text-[#E5C97B]">◈</div>
          <h1 className="text-2xl font-bold">Lab Complete</h1>
          <p className="text-[#A8A2B2] text-sm">{lab.title}</p>
        </div>

        <div className="bg-[#15151D] border border-[#2A2A38] rounded-xl p-6 space-y-4">
          <div className="font-mono text-4xl text-[#E5C97B] font-bold">{xpEarned} XP</div>
          <p className="text-[#A8A2B2] text-sm">awarded for completing this lab</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 rounded-lg bg-[#E5C97B] text-[#0B0B10] font-bold font-mono text-sm tracking-wider hover:brightness-110 active:scale-[0.98] transition-all"
          >
            RETURN TO DASHBOARD
          </Link>
          <Link
            href="/certs"
            className="block w-full py-3 rounded-lg border border-[#2A2A38] text-[#A8A2B2] font-mono text-sm hover:border-[#E5C97B]/40 hover:text-[#F5F1E6] transition-all"
          >
            Browse More Labs
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function LabRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const labId = typeof params['labId'] === 'string' ? params['labId'] : (params['labId']?.[0] ?? '');

  const lab = findLab(labId);

  const addXp = useStore((s) => s.addXp);
  const startLab = useStore((s) => s.startLab);
  const recordLabTask = useStore((s) => s.recordLabTask);
  const completeLab = useStore((s) => s.completeLab);
  const getLabStatus = useStore((s) => s.getLabStatus);

  const [screen, setScreen] = useState<Screen>('setup');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskStates, setTaskStates] = useState<TaskState[]>(() =>
    lab ? initialTaskStates(lab.tasks) : []
  );
  const [xpEarned, setXpEarned] = useState(0);

  // If already completed previously, show complete screen
  const labStatus = lab ? getLabStatus(labId) : 'not_started';

  const handleBegin = useCallback(() => {
    if (!lab) return;
    startLab(lab.id, lab.certId);
    setScreen('lab');
  }, [lab, startLab]);

  const updateTaskState = useCallback((index: number, patch: Partial<TaskState>) => {
    setTaskStates((prev) => {
      const next = [...prev];
      const existing = next[index];
      if (existing) {
        next[index] = { ...existing, ...patch };
      }
      return next;
    });
  }, []);

  const handleAnswerChange = useCallback((index: number, val: string) => {
    updateTaskState(index, { userAnswer: val });
  }, [updateTaskState]);

  const handleCheckAnswer = useCallback(() => {
    if (!lab) return;
    const task = lab.tasks[currentTaskIndex];
    const state = taskStates[currentTaskIndex];
    if (!task || !state) return;

    const expected = task.expected ?? '';
    const isMatch = fuzzyMatch(state.userAnswer, expected);

    if (isMatch) {
      updateTaskState(currentTaskIndex, { completed: true, feedback: 'correct' });
      recordLabTask(lab.id, {
        taskId: task.id,
        completed: true,
        submittedAt: new Date().toISOString(),
        userAnswer: state.userAnswer,
      });
    } else {
      const newAttempts = state.failedAttempts + 1;
      if (newAttempts >= 3) {
        updateTaskState(currentTaskIndex, { failedAttempts: newAttempts, feedback: 'unlocked' });
        recordLabTask(lab.id, {
          taskId: task.id,
          completed: false,
          submittedAt: new Date().toISOString(),
          userAnswer: state.userAnswer,
        });
      } else {
        updateTaskState(currentTaskIndex, { failedAttempts: newAttempts, feedback: 'wrong' });
      }
    }
  }, [lab, currentTaskIndex, taskStates, updateTaskState, recordLabTask]);

  const handleMarkDone = useCallback(() => {
    if (!lab) return;
    const task = lab.tasks[currentTaskIndex];
    const state = taskStates[currentTaskIndex];
    if (!task || !state) return;

    updateTaskState(currentTaskIndex, { completed: true, feedback: 'none' });
    recordLabTask(lab.id, {
      taskId: task.id,
      completed: true,
      submittedAt: new Date().toISOString(),
      userAnswer: state.userAnswer,
    });
  }, [lab, currentTaskIndex, taskStates, updateTaskState, recordLabTask]);

  const handleNext = useCallback(() => {
    if (!lab) return;
    const isLast = currentTaskIndex === lab.tasks.length - 1;
    if (isLast) {
      completeLab(lab.id);
      setXpEarned(lab.xpReward);
      setScreen('complete');
    } else {
      setCurrentTaskIndex((i) => i + 1);
    }
  }, [lab, currentTaskIndex, completeLab]);

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------
  if (!lab) {
    return (
      <div className="min-h-screen bg-[#0B0B10] text-[#F5F1E6] flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-[#6B6878]">Lab not found: <span className="text-[#A8A2B2]">{labId}</span></p>
        <Link href="/dashboard" className="text-[#E5C97B] font-mono text-sm underline">← Back to dashboard</Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Setup screen
  // ---------------------------------------------------------------------------
  if (screen === 'setup') {
    return <SetupScreen lab={lab} onBegin={handleBegin} />;
  }

  // ---------------------------------------------------------------------------
  // Complete screen
  // ---------------------------------------------------------------------------
  if (screen === 'complete') {
    return <CompleteScreen lab={lab} xpEarned={xpEarned || lab.xpReward} />;
  }

  // ---------------------------------------------------------------------------
  // Lab runner screen (two-panel)
  // ---------------------------------------------------------------------------
  const currentTask = lab.tasks[currentTaskIndex];
  const currentState = taskStates[currentTaskIndex];
  const completedCount = taskStates.filter((s) => s.completed).length;

  if (!currentTask || !currentState) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0B10] text-[#F5F1E6] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2A38] bg-[#0B0B10] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#6B6878] font-mono text-xs hover:text-[#A8A2B2] transition-colors">
            ← Dashboard
          </Link>
          <span className="text-[#2A2A38]">|</span>
          <span className="text-[#F5F1E6] text-sm font-semibold truncate max-w-xs">{lab.title}</span>
        </div>
        {/* XP progress */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#A8A2B2]">
          <span className="text-[#E5C97B] font-bold">
            {Math.round((completedCount / lab.tasks.length) * lab.xpReward)}
          </span>
          <span>/ {lab.xpReward} XP earned</span>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-[#2A2A38] rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-[#E5C97B] rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / lab.tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 shrink-0 border-r border-[#2A2A38] bg-[#0B0B10] flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Lab meta */}
            <div className="space-y-1">
              <DifficultyBadge difficulty={lab.difficulty} />
              <p className="text-[#6B6878] font-mono text-xs">{lab.estimatedMinutes} min · {lab.xpReward} XP</p>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              <h2 className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Tasks</h2>
              <ul className="space-y-1">
                {lab.tasks.map((t, i) => {
                  const ts = taskStates[i];
                  const isActive = i === currentTaskIndex;
                  const done = ts?.completed ?? false;
                  const unlocked = ts?.feedback === 'unlocked';
                  return (
                    <li
                      key={t.id}
                      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-default ${
                        isActive
                          ? 'bg-[#1B1B26] border border-[#E5C97B]/20 text-[#F5F1E6]'
                          : done || unlocked
                          ? 'text-[#6B6878]'
                          : 'text-[#A8A2B2]'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs mt-0.5 shrink-0 ${
                          done
                            ? 'text-emerald-400'
                            : unlocked
                            ? 'text-amber-400'
                            : isActive
                            ? 'text-[#E5C97B]'
                            : 'text-[#6B6878]'
                        }`}
                      >
                        {done ? '✓' : unlocked ? '↷' : `${i + 1}.`}
                      </span>
                      <span className="leading-snug line-clamp-2 text-xs">{t.prompt.slice(0, 80)}{t.prompt.length > 80 ? '…' : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Learning objectives */}
            <div className="space-y-2 pt-2 border-t border-[#2A2A38]">
              <h2 className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Objectives</h2>
              <ul className="space-y-1.5">
                {lab.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#6B6878]">
                    <span className="font-mono mt-0.5 shrink-0">[ ]</span>
                    <span className="leading-snug">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className="space-y-2 pt-2 border-t border-[#2A2A38]">
              <h2 className="text-xs font-mono text-[#E5C97B] uppercase tracking-widest">Tools</h2>
              <ul className="space-y-1">
                {lab.tools.map((tool) => (
                  <li key={tool.name} className="text-xs text-[#6B6878]">
                    {tool.url ? (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#A8A2B2] hover:text-[#E5C97B] underline underline-offset-2 transition-colors"
                      >
                        {tool.name}
                      </a>
                    ) : (
                      <span>{tool.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto h-full">
            <TaskPanel
              task={currentTask}
              taskIndex={currentTaskIndex}
              totalTasks={lab.tasks.length}
              state={currentState}
              onAnswerChange={(val) => handleAnswerChange(currentTaskIndex, val)}
              onCheckAnswer={handleCheckAnswer}
              onMarkDone={handleMarkDone}
              onNext={handleNext}
              isLast={currentTaskIndex === lab.tasks.length - 1}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
