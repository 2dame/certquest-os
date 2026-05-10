import { certPacks, getCertLore } from '@certquest/content';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function CertDetailPage({ params }: { params: { certId: string } }) {
  const pack = certPacks[params.certId];
  const lore = getCertLore(params.certId);
  if (!pack || !lore) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/certs" className="text-gold text-sm">{'< Back to Cert Paths'}</Link>
        <p className="text-gold text-xs tracking-[0.25em] uppercase mt-3">{lore.worldName}</p>
        <h1 className="font-serif text-4xl mt-1">{pack.meta.examName}</h1>
        <p className="text-textMuted text-sm mt-1">{pack.meta.examCode}</p>
        <p className="text-text italic mt-3">"{lore.tagline}"</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card accent>
          <CardTitle>Mentor</CardTitle>
          <p className="text-xl mt-2">{lore.mentor.name}</p>
          <p className="text-textMuted text-sm mt-1">{lore.mentor.title}</p>
          {lore.mentor.catchphrase && (
            <p className="text-text italic text-sm mt-3">"{lore.mentor.catchphrase}"</p>
          )}
        </Card>
        {lore.rival && (
          <Card className="border-danger">
            <p className="text-danger text-xs tracking-[0.25em] uppercase">Threat</p>
            <p className="text-xl mt-2">{lore.rival.name}</p>
            <p className="text-textMuted text-sm mt-1">{lore.rival.title}</p>
            <p className="text-text text-sm mt-3 leading-relaxed">{lore.rival.purpose}</p>
          </Card>
        )}
      </div>

      <section>
        <h2 className="font-serif text-2xl mb-4">World Map</h2>
        <div className="grid gap-3">
          {lore.regions.map((region) => {
            const domain = (pack.domains as any[]).find((d) => d.id === region.domainId);
            const objectives = (pack.objectives as any[]).filter((o) => o.domainId === region.domainId);
            const lessons = (pack.lessons as any[]).filter((l) =>
              objectives.some((o) => o.id === l.objectiveId));
            return (
              <Link key={region.domainId}
                href={`/certs/${params.certId}/domains/${region.domainId}`}
                className="block border border-border bg-bgCard p-5 hover:border-gold transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-serif text-xl">{region.regionName}</p>
                    <p className="text-textMuted text-sm mt-1">{domain?.title} · {Math.round((domain?.weight ?? 0) * 100)}% of exam</p>
                    <p className="text-textMuted text-sm mt-2 italic">{region.description}</p>
                    <p className="text-danger text-xs mt-2">Threat: {region.threat}</p>
                  </div>
                  <div className="text-right text-xs text-textMuted ml-6">
                    <p>{lessons.length} lessons</p>
                    <p className="mt-1">{objectives.length} objectives</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Trials</h2>
        <div className="grid gap-2">
          {(pack.bossBattles as any[]).map((boss) => (
            <Card key={boss.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gold text-[10px] tracking-[0.25em]">BOSS BATTLE</p>
                  <p className="font-semibold mt-1">{boss.title}</p>
                  <p className="text-textMuted text-sm mt-1">Pass {boss.rubric.passThreshold}% rubric</p>
                </div>
                <p className="text-textMuted text-xs">OPEN</p>
              </div>
            </Card>
          ))}
          {(pack.practiceExams as any[]).map((exam) => (
            <Card key={exam.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gold text-[10px] tracking-[0.25em]">CERTIFICATION TRIAL</p>
                  <p className="font-semibold mt-1">{exam.title}</p>
                  <p className="text-textMuted text-sm mt-1">
                    {exam.questionCount} questions · {Math.round(exam.timeLimitSeconds / 60)} min · pass {exam.passingScore}/{exam.scaledScoreMax}
                  </p>
                </div>
                <Link href={`/practice/${params.certId}/exam/${exam.id}`} className="text-gold text-xs tracking-[0.25em]">
                  VIEW {'>'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
