'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { certPacks, getCertLore, getRegionForDomain, certDisplayOrder } from '@certquest/content';
import { generateTodayPlan, type PlanTask } from '@certquest/scheduler';
import { rankForXp } from '@certquest/gamification';
import { useStore } from '@/lib/store';

const KIND_LABEL: Record<PlanTask['kind'], string> = {
  review: 'REVIEW', lesson: 'LESSON', quiz: 'QUIZ',
  minigame: 'GAME', boss: 'BOSS', practice_exam: 'EXAM',
};
const KIND_COLOR: Record<PlanTask['kind'], string> = {
  review: 'text-gold', lesson: 'text-gold', quiz: 'text-gold',
  minigame: 'text-gold', boss: 'text-oxblood', practice_exam: 'text-gold',
};

export default function DashboardPage() {
  const router = useRouter();
  const activeCertId = useStore((s) => s.activeCertId);
  const setActiveCert = useStore((s) => s.setActiveCert);
  const settings = useStore((s) => s.settings);
  const completedLessons = useStore((s) => s.completedLessons);
  const objectiveMastery = useStore((s) => s.objectiveMastery);
  const bossAttempts = useStore((s) => s.bossBattleAttempts);
  const examAttempts = useStore((s) => s.examAttempts);
  const readiness = useStore((s) => s.readinessByCert[activeCertId]);
  const getDueFlashcards = useStore((s) => s.getDueFlashcards);
  const wrongCount = useStore((s) => s.getWrongAnswers(activeCertId).length);
  const diagnostic = useStore((s) => s.diagnosticTaken[activeCertId]);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const recompute = useStore((s) => s.recomputeReadinessForCert);

  useEffect(() => { recompute(activeCertId); }, [activeCertId]);

  const pack = certPacks[activeCertId];
  const lore = getCertLore(activeCertId);

  const plan = useMemo(() => {
    if (!pack) return null;
    const completedForCert = completedLessons.filter((c) => c.certId === activeCertId).map((c) => c.lessonId);
    const passedBosses = bossAttempts.filter((b) => b.certId === activeCertId && b.passed).map((b) => b.bossId);
    const passedExams = examAttempts.filter((e) => e.certId === activeCertId && e.passEstimate).map((e) => e.blueprintId);
    const dueCount = getDueFlashcards(activeCertId).length;
    const completedSet = new Set(completedForCert);
    const nextLesson = pack.lessons.find((l) => !completedSet.has(l.id));
    const nextObj = nextLesson ? pack.objectives.find((o) => o.id === nextLesson.objectiveId) : null;
    const region = nextObj ? getRegionForDomain(activeCertId, nextObj.domainId) : undefined;
    return generateTodayPlan({
      certId: activeCertId, studyIntensity: settings.studyIntensity,
      lessons: pack.lessons, objectives: pack.objectives, domains: pack.domains,
      sideQuests: pack.sideQuests, bossBattles: pack.bossBattles, practiceExams: pack.practiceExams,
      completedLessonIds: completedForCert, passedBossBattleIds: passedBosses, passedPracticeExamIds: passedExams,
      dueFlashcardCount: dueCount, objectiveMastery,
      readiness: readiness ? { overall: readiness.overall, domains: readiness.domains } : undefined,
      currentRegion: region ? { regionName: region.regionName, threat: region.threat } : undefined,
    });
  }, [activeCertId, settings.studyIntensity, completedLessons, bossAttempts, examAttempts, objectiveMastery, readiness]);

  // Keyboard shortcuts: 1-9 jump to nth task — declared after plan
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        const task = plan?.tasks[n - 1];
        if (task) router.push(task.routeHint as string);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [plan, router]);

  if (!pack || !lore || !plan) return <div className="text-textMuted p-10">Loading...</div>;

  const overall = readiness?.overall ?? 0;
  const rank = rankForXp(xp);
  const passedBossSet = new Set(bossAttempts.filter((b) => b.certId === activeCertId && b.passed).map((b) => b.bossId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName}</p>
          <h1 className="font-serif text-4xl mt-1 text-text">{pack.meta.examName}</h1>
          <p className="text-textMuted text-sm italic mt-1">{lore.userRole}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={activeCertId}
            onChange={(e) => setActiveCert(e.target.value)}
            className="bg-bgCard border border-border text-text text-sm px-3 py-1.5 focus:outline-none focus:border-gold"
          >
            {certDisplayOrder.map((cid) => {
              const p = certPacks[cid]!;
              return <option key={cid} value={cid}>{p.meta.examCode} — {p.meta.examName}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Readiness" value={`${overall}%`} sub={overall >= 80 ? 'Exam ready' : `Need ${80 - overall}% more`} highlight={overall >= 80} />
        <StatCard label="XP" value={xp.toLocaleString()} sub={`Rank: ${rank}`} />
        <StatCard label="Streak" value={`${streak.current}d`} sub={`Best: ${streak.longest}d`} />
        <StatCard label="Intensity" value={settings.studyIntensity.toUpperCase()} sub={`~${plan.estimatedMinutes} min today`} />
        {(() => {
          const examDate = settings.examDates[activeCertId];
          if (!examDate) return <StatCard label="Exam Date" value="—" sub="Set in Settings" />;
          const daysLeft = Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000);
          if (daysLeft < 0) return <StatCard label="Exam Date" value="Past" sub={examDate} />;
          return <StatCard label="Exam In" value={`${daysLeft}d`} sub={examDate} highlight={daysLeft <= 14} />;
        })()}
      </div>

      {/* Mentor message */}
      {plan.mentorIntro && (
        <div className="border border-gold bg-bgCard p-4">
          <p className="text-gold text-[10px] tracking-widest uppercase">{lore.mentor.name}</p>
          <p className="text-text text-sm mt-2 leading-relaxed">{plan.mentorIntro}</p>
        </div>
      )}

      {/* Weak domain */}
      {plan.weakDomain && (
        <div className="border border-red-800 bg-bgCard p-3 flex items-center gap-4">
          <span className="text-red-400 text-[10px] tracking-widest uppercase shrink-0">Weak Domain</span>
          <span className="text-text text-sm font-semibold">{plan.weakDomain.title}</span>
          <span className="text-textMuted text-xs">{plan.weakDomain.score}%</span>
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {/* Diagnostic CTA */}
          {!diagnostic && (
            <Link href={`/practice/diagnostic/${activeCertId}`} className="flex items-center justify-between p-4 border-2 border-gold bg-bgCard hover:bg-bgElevated transition group">
              <div>
                <p className="text-gold text-[10px] tracking-widest uppercase">Baseline Diagnostic</p>
                <p className="text-text font-semibold mt-1">Calibrate where you stand</p>
                <p className="text-textMuted text-xs mt-0.5">30 mixed-domain questions · run before everything else</p>
              </div>
              <span className="text-gold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {/* Wrong answer review */}
          {wrongCount > 0 && (
            <Link href={`/practice/wrong-answers?certId=${activeCertId}`} className="flex items-center justify-between p-4 border border-red-800 bg-bgCard hover:bg-bgElevated transition group">
              <div>
                <p className="text-red-400 text-[10px] tracking-widest uppercase">Wrong Answer Review</p>
                <p className="text-text font-semibold mt-1">{wrongCount} unresolved miss{wrongCount === 1 ? '' : 'es'}</p>
                <p className="text-textMuted text-xs mt-0.5">Walk through them with explanations</p>
              </div>
              <span className="text-textMuted text-xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {/* Today's tasks */}
          <div>
            <p className="text-textMuted text-[10px] tracking-widest uppercase mb-2">Today's Tasks · {plan.tasks.length} scheduled</p>
            {plan.tasks.length === 0 ? (
              <p className="text-textMuted text-sm italic p-4 border border-border">Nothing scheduled. Adjust intensity in Settings.</p>
            ) : (
              <div className="space-y-1">
                {plan.tasks.map((task, ti) => (
                  <Link key={`${task.kind}-${task.id}`} href={task.routeHint as string} className="flex items-center gap-4 p-3 border border-border bg-bgCard hover:border-gold hover:bg-bgElevated transition group">
                    {ti < 9 && (
                      <kbd className="text-textDim text-[10px] font-mono border border-border/50 px-1 shrink-0 hidden group-hover:block">{ti + 1}</kbd>
                    )}
                    <span className={`text-[10px] font-bold w-10 shrink-0 ${KIND_COLOR[task.kind]}`}>{KIND_LABEL[task.kind]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text text-sm font-semibold truncate">{task.title}</p>
                      <p className="text-textMuted text-xs">{task.subtitle}</p>
                    </div>
                    <p className="text-textDim text-xs italic shrink-0 hidden group-hover:block">{task.reason}</p>
                    <span className="text-textMuted group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — practice exams */}
        <div className="space-y-3">
          <p className="text-textMuted text-[10px] tracking-widest uppercase">Practice Exams</p>
          {pack.practiceExams.map((exam) => {
            const reqs = exam.unlockRequirements;
            const minReadinessOk = overall >= reqs.minReadiness;
            const allDomainsOk = readiness ? readiness.domains.every((d: any) => d.score >= reqs.minDomainReadiness) : false;
            const bossesOk = (reqs.requiredBossBattlesPassed ?? []).every((id: string) => passedBossSet.has(id));
            const priorPassOk = !reqs.requiresPriorPracticeExamPass || examAttempts.some((e) => e.certId === activeCertId && e.passEstimate);
            const unlocked = minReadinessOk && allDomainsOk && bossesOk && priorPassOk;

            return (
              <Link
                key={exam.id}
                href={unlocked ? `/practice/${activeCertId}/exam/${exam.id}` : '#'}
                className={`block p-3 border bg-bgCard transition ${unlocked ? 'border-border hover:border-gold cursor-pointer' : 'border-border opacity-60 cursor-not-allowed'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-text text-xs font-semibold leading-tight">{exam.title}</p>
                  <span className={`text-[10px] font-bold tracking-widest shrink-0 ${unlocked ? 'text-gold' : 'text-textMuted'}`}>{unlocked ? 'OPEN' : 'LOCKED'}</span>
                </div>
                <p className="text-textMuted text-[10px] mt-1">{exam.questionCount}q · {Math.round(exam.timeLimitSeconds / 60)}min</p>
                {!unlocked && (
                  <div className="mt-2 space-y-0.5">
                    {!minReadinessOk && <p className="text-textMuted text-[10px]">· Need {reqs.minReadiness}% readiness ({overall}% now)</p>}
                    {!bossesOk && <p className="text-textMuted text-[10px]">· Boss battles required</p>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="border border-border bg-bgCard p-4">
      <p className="text-textMuted text-[10px] tracking-widest uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-gold' : 'text-text'}`}>{value}</p>
      <p className="text-textMuted text-xs mt-0.5">{sub}</p>
    </div>
  );
}
