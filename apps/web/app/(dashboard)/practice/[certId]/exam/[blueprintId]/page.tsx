import { certPacks, getCertLore } from '@certquest/content';
import { Card, CardTitle } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function ExamBlueprintPage({ params }: { params: { certId: string; blueprintId: string } }) {
  const pack = certPacks[params.certId];
  const lore = getCertLore(params.certId);
  if (!pack || !lore) notFound();
  const exam = (pack.practiceExams as any[]).find((e) => e.id === params.blueprintId);
  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/practice/${params.certId}`} className="text-gold text-sm">{'< Back'}</Link>
      <div>
        <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName} · Certification Trial</p>
        <h1 className="font-serif text-3xl mt-1">{exam.title}</h1>
      </div>

      {exam.loreTrial && (
        <Card accent>
          <p className="font-serif text-lg italic">"{exam.loreTrial.unlockMessage}"</p>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card><CardTitle>Questions</CardTitle><p className="text-2xl mt-2">{exam.questionCount}</p></Card>
        <Card><CardTitle>Time Limit</CardTitle><p className="text-2xl mt-2">{Math.round(exam.timeLimitSeconds / 60)} min</p></Card>
        <Card><CardTitle>Passing Score</CardTitle><p className="text-2xl mt-2">{exam.passingScore}/{exam.scaledScoreMax}</p></Card>
      </div>

      <Card>
        <CardTitle>Domain Targets</CardTitle>
        <div className="mt-3 space-y-2">
          {exam.domainTargets.map((t: any) => {
            const domain = (pack.domains as any[]).find((d) => d.id === t.domainId);
            const available = (pack.questionBank as any[]).filter((q) => q.domainId === t.domainId).length;
            const gap = available < t.questionCount;
            return (
              <div key={t.domainId} className="flex justify-between text-sm">
                <span>{domain?.title}</span>
                <span className={gap ? 'text-danger' : 'text-textMuted'}>
                  {t.questionCount} target · {available} authored {gap && '(gap)'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Unlock Requirements</CardTitle>
        <ul className="mt-3 space-y-1 text-sm text-textMuted">
          <li>· {exam.unlockRequirements.minReadiness}% overall readiness</li>
          <li>· {exam.unlockRequirements.minDomainReadiness}% per domain</li>
          {(exam.unlockRequirements.requiredBossBattlesPassed ?? []).length > 0 && (
            <li>· {(exam.unlockRequirements.requiredBossBattlesPassed ?? []).length} boss battle(s) passed</li>
          )}
          {exam.unlockRequirements.priorPracticeExamPass && (
            <li>· Prior practice exam pass required</li>
          )}
        </ul>
        <p className="text-textMuted text-xs mt-4 italic">
          The exam runner is on mobile. Open the Expo app to take this trial.
        </p>
      </Card>
    </div>
  );
}
