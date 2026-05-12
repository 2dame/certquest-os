'use client';

import { useEffect, useState } from 'react';
import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { CORE_BADGES, nextRankInfo } from '@certquest/gamification';
import { useStore } from '@/lib/store';

// ── Helpers ──────────────────────────────────────────────────────────────────

interface DayCell { dateKey: string; events: number; }

function buildStudyDays(
  completedLessons: any[],
  flashcardReviews: any[],
  quizAttempts: any[],
  bossAttempts: any[],
  examAttempts: any[],
): DayCell[] {
  const counts: Record<string, number> = {};
  const tally = (iso: string) => {
    if (!iso) return;
    const key = iso.slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  };
  completedLessons.forEach((l) => tally(l.completedAt));
  flashcardReviews.forEach((r) => tally(r.reviewedAt));
  quizAttempts.forEach((q) => tally(q.attemptedAt));
  bossAttempts.forEach((b) => tally(b.attemptedAt));
  examAttempts.forEach((e) => tally(e.takenAt));
  const days: DayCell[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ dateKey: key, events: counts[key] ?? 0 });
  }
  return days;
}

function heatColor(intensity: number): string {
  if (intensity === 0) return '#0B0B10';
  if (intensity < 0.34) return '#3a2a08';
  if (intensity < 0.67) return '#7a5a14';
  return '#E5C97B';
}

function StreakCalendar({ days }: { days: DayCell[] }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const maxEvents = Math.max(1, ...days.map((d) => d.events));
  // Split into rows of 7 (one week per row)
  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="border border-border bg-bgElevated p-5">
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day) => {
              const intensity = day.events === 0 ? 0 : Math.min(1, day.events / maxEvents);
              const isToday = day.dateKey === todayKey;
              return (
                <div
                  key={day.dateKey}
                  title={`${day.dateKey}: ${day.events} activities`}
                  className={['w-7 h-7 flex-shrink-0', isToday ? 'ring-1 ring-text' : ''].join(' ')}
                  style={{ backgroundColor: heatColor(intensity) }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-textMuted text-[10px] tracking-widest">12 weeks ago</span>
        <div className="flex gap-1 items-center">
          {[0, 0.3, 0.6, 1].map((v, i) => (
            <div key={i} className="w-4 h-4" style={{ backgroundColor: heatColor(v) }} />
          ))}
        </div>
        <span className="text-textMuted text-[10px] tracking-widest">today</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const activeCertId = useStore((s) => s.activeCertId);
  const readinessByCert = useStore((s) => s.readinessByCert);
  const objectiveMastery = useStore((s) => s.objectiveMastery);
  const examAttempts = useStore((s) => s.examAttempts);
  const completedLessons = useStore((s) => s.completedLessons);
  const flashcardReviews = useStore((s) => s.flashcardReviews);
  const quizAttempts = useStore((s) => s.quizAttempts);
  const bossAttempts = useStore((s) => s.bossBattleAttempts);
  const badges = useStore((s) => s.badges);
  const xp = useStore((s) => s.xp);
  const xpByCert = useStore((s) => s.xpByCert);
  const streak = useStore((s) => s.streak);

  const activePack = certPacks[activeCertId];
  const activeLore = getCertLore(activeCertId);
  const activeReadiness = readinessByCert[activeCertId];
  const rankInfo = nextRankInfo(xp);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  const studyDays = buildStudyDays(completedLessons, flashcardReviews, quizAttempts, bossAttempts, examAttempts);
  const totalActivities = studyDays.reduce((s, d) => s + d.events, 0);
  const activeDays = studyDays.filter((d) => d.events > 0).length;

  return (
    <div className="space-y-10 pb-16">
      {/* ── Page title ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-1">Progress</p>
          <h1 className="font-serif text-4xl text-text">Your training record</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="border border-border text-textMuted text-xs px-4 py-2 hover:border-gold hover:text-gold transition-colors print:hidden"
        >
          Print Report
        </button>
      </div>

      {/* ── XP / Rank / Streak ── */}
      <section>
        <div className="border border-gold bg-bgElevated p-6">
          <div className="grid grid-cols-4 gap-6 divide-x divide-border">
            <div className="text-center">
              <p className="text-gold text-2xl font-bold">{rankInfo.current}</p>
              <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Rank</p>
            </div>
            <div className="text-center pl-6">
              <p className="text-gold text-2xl font-bold">{xp.toLocaleString()}</p>
              <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Total XP</p>
            </div>
            <div className="text-center pl-6">
              <p className="text-gold text-2xl font-bold">{streak.current}d</p>
              <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Streak</p>
            </div>
            <div className="text-center pl-6">
              <p className="text-gold text-2xl font-bold">{streak.longest}d</p>
              <p className="text-textMuted text-[10px] tracking-widest uppercase mt-1">Longest</p>
            </div>
          </div>

          {rankInfo.next && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex justify-between text-xs text-textMuted mb-2">
                <span>{rankInfo.current}</span>
                <span className="text-gold">{rankInfo.xpToNext} XP to {rankInfo.next}</span>
                <span>{rankInfo.next}</span>
              </div>
              <div className="h-1.5 bg-bg">
                <div
                  className="h-1.5 bg-gold transition-all"
                  style={{ width: `${rankInfo.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Readiness by cert ── */}
      <section>
        <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold mb-4">Readiness by Cert</h2>
        <div className="grid grid-cols-2 gap-4">
          {certDisplayOrder.map((id) => {
            const pack = certPacks[id]!;
            const lore = getCertLore(id);
            const r = readinessByCert[id];
            const overall = r?.overall ?? 0;
            const certXp = xpByCert[id] ?? 0;
            return (
              <div key={id} className="border border-border bg-bgElevated p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-gold text-[10px] tracking-[0.2em] uppercase font-bold">{lore?.worldName}</p>
                    <p className="text-text font-semibold text-sm mt-0.5">{pack.meta.examCode}</p>
                  </div>
                  <p className="text-text text-xl font-bold">{overall}%</p>
                </div>
                <div className="relative h-1.5 bg-bg">
                  <div className="h-1.5 bg-gold" style={{ width: `${overall}%` }} />
                  {r?.ceilingApplied && (
                    <div className="absolute top-0 bottom-0 bg-danger w-px" style={{ left: '70%' }} />
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-textMuted text-[10px]">{certXp.toLocaleString()} XP</span>
                  {r?.ceilingApplied && (
                    <span className="text-danger text-[10px]">70% ceiling — pass a boss to lift</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Domain breakdown (active cert) ── */}
      {activePack && activeReadiness && (
        <section>
          <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold mb-4">
            Domain Breakdown — {activeLore?.worldName ?? activePack.meta.examCode}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[...activeReadiness.domains]
              .sort((a: any, b: any) => a.score - b.score)
              .map((d: { domainId: string; score: number }) => {
                const dom = activePack.domains.find((x) => x.id === d.domainId);
                const region = activeLore?.regions.find((r) => r.domainId === d.domainId);
                const isWeak = d.score < 65;
                return (
                  <div key={d.domainId} className="border border-border bg-bgElevated p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-text text-sm font-semibold leading-snug flex-1 pr-3">
                        {region?.regionName ?? dom?.title}
                      </p>
                      <p className={['text-sm font-bold flex-shrink-0', isWeak ? 'text-danger' : 'text-gold'].join(' ')}>
                        {d.score}%
                      </p>
                    </div>
                    <p className="text-textMuted text-[10px] mb-2">{dom?.title}</p>
                    <div className="h-1 bg-bg">
                      <div
                        className="h-1"
                        style={{
                          width: `${d.score}%`,
                          backgroundColor: isWeak ? '#7A1F2C' : '#E5C97B',
                        }}
                      />
                    </div>
                    {region?.threat && (
                      <p className="text-danger text-[10px] italic mt-2">Threat: {region.threat}</p>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ── Objective mastery (active cert) ── */}
      {activePack && (
        <section>
          <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold mb-4">
            Objective Mastery — {activePack.meta.examCode}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {activePack.objectives.map((obj) => {
              const mastery = Math.round((objectiveMastery[obj.id] ?? 0) * 100);
              const dom = activePack.domains.find((d) => d.id === obj.domainId);
              return (
                <div key={obj.id} className="border border-border bg-bgElevated p-4">
                  <div className="flex items-start justify-between mb-0.5">
                    <p className="text-text text-xs font-semibold leading-snug flex-1 pr-3 line-clamp-2">{obj.title}</p>
                    <p className="text-gold text-xs font-bold flex-shrink-0">{mastery}%</p>
                  </div>
                  <p className="text-textMuted text-[10px] mb-2">{dom?.title}</p>
                  <div className="h-1 bg-bg">
                    <div className="h-1 bg-gold" style={{ width: `${mastery}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Badges grid ── */}
      <section>
        <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold mb-4">Badges</h2>
        <div className="grid grid-cols-4 gap-4">
          {CORE_BADGES.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={[
                  'border p-4 flex flex-col gap-1 transition-opacity',
                  earned ? 'border-gold opacity-100' : 'border-border opacity-50',
                ].join(' ')}
              >
                <p className={['font-semibold text-sm', earned ? 'text-gold' : 'text-textMuted'].join(' ')}>
                  {b.name}
                </p>
                <p className="text-textMuted text-[10px] italic">{b.loreTitle}</p>
                <p className="text-textMuted text-[10px] mt-1 leading-snug flex-1">
                  {earned ? b.titleFlavor : b.description}
                </p>
                {!earned && (
                  <p className="text-danger text-[9px] tracking-[0.25em] uppercase mt-2">Locked</p>
                )}
                {earned && (
                  <p className="text-gold text-[9px] tracking-[0.25em] uppercase mt-2">Earned</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 12-week study calendar ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold">
            12-Week Study Calendar
          </h2>
          <p className="text-textMuted text-xs">{activeDays} active days · {totalActivities} total activities</p>
        </div>
        <StreakCalendar days={studyDays} />
      </section>

      {/* ── Practice exam history ── */}
      <section>
        <h2 className="text-text text-[11px] tracking-[0.2em] uppercase font-semibold mb-4">
          Practice Exam History
        </h2>
        {examAttempts.length === 0 ? (
          <p className="text-textMuted text-sm italic">No practice exams taken yet.</p>
        ) : (
          <div className="space-y-2">
            {[...examAttempts].reverse().slice(0, 10).map((a) => {
              const pack = certPacks[a.certId];
              const exam = pack?.practiceExams.find((e) => e.id === a.blueprintId);
              return (
                <div
                  key={a.attemptId}
                  className="flex items-center gap-4 border border-border bg-bgElevated px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-semibold truncate">
                      {exam?.title ?? a.blueprintId}
                    </p>
                    <p className="text-textMuted text-xs mt-0.5">
                      {new Date(a.takenAt).toLocaleDateString()} · {pack?.meta.examCode}
                    </p>
                  </div>
                  <p className={['text-lg font-bold w-16 text-right', a.passEstimate ? 'text-gold' : 'text-text'].join(' ')}>
                    {a.scaledScore}
                  </p>
                  <p
                    className={[
                      'text-[10px] tracking-[0.25em] font-bold w-10 text-right',
                      a.passEstimate ? 'text-gold' : 'text-danger',
                    ].join(' ')}
                  >
                    {a.passEstimate ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
