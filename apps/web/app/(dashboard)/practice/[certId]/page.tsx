import { certPacks, getCertLore } from '@certquest/content';
import { Card } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function PracticeCertPage({ params }: { params: { certId: string } }) {
  const pack = certPacks[params.certId];
  const lore = getCertLore(params.certId);
  if (!pack || !lore) notFound();

  return (
    <div className="space-y-6">
      <Link href="/practice" className="text-gold text-sm">{'< Back to Practice'}</Link>
      <div>
        <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName}</p>
        <h1 className="font-serif text-3xl mt-1">{pack.meta.examName} — Practice Trials</h1>
      </div>
      <section>
        <h2 className="font-serif text-xl mb-4">Exam Blueprints</h2>
        <div className="grid gap-3">
          {(pack.practiceExams as any[]).map((exam) => (
            <Card key={exam.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-textMuted text-sm mt-1">
                    {exam.questionCount} questions · {Math.round(exam.timeLimitSeconds / 60)} min · pass {exam.passingScore}/{exam.scaledScoreMax}
                  </p>
                  {exam.loreTrial?.unlockMessage && (
                    <p className="text-text italic text-sm mt-3">"{exam.loreTrial.unlockMessage}"</p>
                  )}
                  <div className="mt-3 text-xs text-textMuted">
                    <p className="font-semibold text-text">Unlock requirements:</p>
                    <p>· {exam.unlockRequirements.minReadiness}% overall readiness</p>
                    <p>· {exam.unlockRequirements.minDomainReadiness}% per domain</p>
                    {(exam.unlockRequirements.requiredBossBattlesPassed ?? []).length > 0 && (
                      <p>· {(exam.unlockRequirements.requiredBossBattlesPassed ?? []).length} boss battle(s) passed</p>
                    )}
                    {exam.unlockRequirements.priorPracticeExamPass && (
                      <p>· Prior practice exam pass required</p>
                    )}
                  </div>
                </div>
                <Link href={`/practice/${params.certId}/exam/${exam.id}`} className="text-gold text-xs tracking-[0.25em] ml-4">
                  VIEW {'>'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-serif text-xl mb-4">Question Bank Coverage</h2>
        <div className="grid grid-cols-2 gap-3">
          {(pack.domains as any[]).map((d) => {
            const count = (pack.questionBank as any[]).filter((q) => q.domainId === d.id).length;
            return (
              <Card key={d.id}>
                <p className="font-semibold text-sm">{d.title}</p>
                <p className="text-textMuted text-xs mt-1">{count} questions · {Math.round(d.weight * 100)}% weight</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
