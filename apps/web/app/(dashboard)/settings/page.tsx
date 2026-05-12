'use client';

import { useEffect, useState } from 'react';
import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { useStore } from '@/lib/store';
import type { Settings } from '@/lib/store';

type Intensity = Settings['studyIntensity'];

const INTENSITY_DESC: Record<Intensity, string> = {
  chill: '~15 min · 3 tasks',
  normal: '~30 min · 5 tasks',
  aggressive: '~60 min · 8 tasks',
};

const INTENSITY_DETAIL: Record<Intensity, string> = {
  chill: 'Relaxed pace. Great for maintenance or when life is busy.',
  normal: 'Balanced daily sessions. Recommended for most learners.',
  aggressive: 'High-volume cramming. Best for exam countdowns.',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text text-[11px] tracking-[0.25em] uppercase font-semibold mb-3">{children}</p>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-bgElevated p-6 space-y-4">{children}</div>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const activeCertId = useStore((s) => s.activeCertId);
  const setActiveCert = useStore((s) => s.setActiveCert);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const resetProgress = useStore((s) => s.resetProgress);

  const [examDateDrafts, setExamDateDrafts] = useState<Record<string, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync drafts from store once mounted
  useEffect(() => {
    if (mounted) setExamDateDrafts(settings.examDates);
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  function setIntensity(i: Intensity) {
    updateSettings({ studyIntensity: i });
  }

  function commitExamDate(certId: string, value: string) {
    const trimmed = value.trim();
    setExamDateDrafts((d) => ({ ...d, [certId]: trimmed }));
    updateSettings({ examDates: { ...settings.examDates, [certId]: trimmed } });
  }

  function handleReset() {
    resetProgress();
    setShowResetConfirm(false);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10 pb-16">
      {/* ── Page title ── */}
      <div>
        <h1 className="font-serif text-4xl text-text">Settings</h1>
        <p className="text-textMuted text-sm mt-2">Local-only. No login required.</p>
      </div>

      {/* ── Stats hero ── */}
      <div className="border border-border bg-bgElevated p-6 grid grid-cols-3 divide-x divide-border">
        <div className="text-center">
          <p className="text-text text-2xl font-bold">{xp.toLocaleString()}</p>
          <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">XP</p>
        </div>
        <div className="text-center">
          <p className="text-text text-2xl font-bold">{streak.current}d</p>
          <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Streak</p>
        </div>
        <div className="text-center">
          <p className="text-text text-2xl font-bold">{streak.longest}d</p>
          <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Best</p>
        </div>
      </div>

      {/* ── Active cert ── */}
      <section>
        <SectionLabel>Active Cert</SectionLabel>
        <SectionCard>
          <p className="text-textMuted text-xs leading-relaxed">
            The active cert drives your dashboard focus, daily plan, and readiness tracking.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {certDisplayOrder.map((cid) => {
              const pack = certPacks[cid]!;
              const lore = getCertLore(cid);
              const isActive = cid === activeCertId;
              return (
                <button
                  key={cid}
                  onClick={() => setActiveCert(cid)}
                  className={[
                    'border px-4 py-2.5 text-left transition-colors group',
                    isActive
                      ? 'border-gold bg-bg'
                      : 'border-border hover:border-textMuted',
                  ].join(' ')}
                >
                  <p className={['text-sm font-bold tracking-wide', isActive ? 'text-gold' : 'text-textMuted'].join(' ')}>
                    {pack.meta.examCode}
                  </p>
                  <p className="text-textMuted text-[10px] mt-0.5">{lore?.worldName}</p>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </section>

      {/* ── Study intensity ── */}
      <section>
        <SectionLabel>Study Intensity</SectionLabel>
        <SectionCard>
          <p className="text-textMuted text-xs leading-relaxed">
            Controls how many tasks appear in your daily plan and how aggressive the spaced
            repetition scheduler will pace your cards.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {(['chill', 'normal', 'aggressive'] as Intensity[]).map((i) => {
              const isActive = settings.studyIntensity === i;
              return (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={[
                    'border p-4 text-left transition-colors',
                    isActive
                      ? 'border-gold bg-bg'
                      : 'border-border hover:border-textMuted',
                  ].join(' ')}
                >
                  <p className={['font-bold text-sm tracking-[0.15em] uppercase', isActive ? 'text-gold' : 'text-textMuted'].join(' ')}>
                    {i}
                  </p>
                  <p className="text-textMuted text-xs mt-1">{INTENSITY_DESC[i]}</p>
                  <p className="text-textMuted text-[10px] mt-2 leading-snug">{INTENSITY_DETAIL[i]}</p>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </section>

      {/* ── Exam dates ── */}
      <section>
        <SectionLabel>Exam Dates</SectionLabel>
        <SectionCard>
          <p className="text-textMuted text-xs leading-relaxed">
            Set target exam dates so the readiness engine can pace your study sessions. Format: YYYY-MM-DD.
          </p>
          <div className="space-y-3 pt-1">
            {certDisplayOrder.map((cid) => {
              const pack = certPacks[cid]!;
              const lore = getCertLore(cid);
              const draft = examDateDrafts[cid] ?? '';
              const saved = settings.examDates[cid];
              const daysUntil = saved
                ? Math.ceil((new Date(saved).getTime() - Date.now()) / 86400000)
                : null;
              return (
                <div
                  key={cid}
                  className="flex items-center gap-4 border border-border px-4 py-3 bg-bg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-semibold">{pack.meta.examCode}</p>
                    <p className="text-textMuted text-[10px] mt-0.5">{lore?.worldName}</p>
                  </div>
                  {daysUntil !== null && daysUntil > 0 && (
                    <p className="text-gold text-xs font-semibold flex-shrink-0">{daysUntil}d</p>
                  )}
                  <input
                    type="text"
                    value={draft}
                    placeholder="YYYY-MM-DD"
                    onChange={(e) => setExamDateDrafts((d) => ({ ...d, [cid]: e.target.value }))}
                    onBlur={() => commitExamDate(cid, draft)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitExamDate(cid, draft); }}
                    className="border border-border bg-bgElevated text-text text-sm px-3 py-1.5 w-36 font-mono placeholder:text-textMuted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>

      {/* ── Cloud sync placeholder ── */}
      <section>
        <SectionLabel>Cloud Sync</SectionLabel>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text text-sm font-semibold">Supabase sync (optional)</p>
              <p className="text-textMuted text-xs mt-1">
                Currently disabled. The app runs fully local. Sync support will allow study sessions
                to merge across devices when available.
              </p>
            </div>
            <span className="text-gold text-[10px] tracking-[0.25em] font-bold flex-shrink-0 ml-6">
              SOON
            </span>
          </div>
        </SectionCard>
      </section>

      {/* ── Danger zone ── */}
      <section>
        <SectionLabel>Danger Zone</SectionLabel>
        <div className="border border-danger bg-bgElevated p-6 space-y-4">
          <div>
            <p className="text-text text-sm font-semibold">Reset all progress</p>
            <p className="text-textMuted text-xs mt-1 leading-relaxed">
              Wipes lessons, quizzes, flashcards, boss battles, practice exams, XP, streak, and
              badges. This cannot be undone.
            </p>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="border border-danger text-danger text-sm font-bold tracking-[0.15em] px-6 py-2.5 hover:bg-danger hover:text-bg transition-colors"
            >
              RESET LOCAL PROGRESS
            </button>
          ) : (
            <div className="border border-danger bg-bg p-4 space-y-3">
              <p className="text-danger text-sm font-semibold">Are you sure? This cannot be undone.</p>
              <p className="text-textMuted text-xs">
                All XP, streak, quiz history, flashcard schedules, boss battle records, and badges
                will be permanently deleted from this device.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleReset}
                  className="bg-danger text-text text-sm font-bold tracking-[0.15em] px-6 py-2.5 hover:opacity-90 transition-opacity"
                >
                  YES, RESET EVERYTHING
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="border border-border text-textMuted text-sm px-6 py-2.5 hover:border-textMuted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="text-textMuted text-[10px] text-center tracking-widest">
        CertQuest OS · v0.1 · local-first
      </p>
    </div>
  );
}
