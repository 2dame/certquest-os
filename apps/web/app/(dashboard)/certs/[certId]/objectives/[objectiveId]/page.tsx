import { certPacks } from '@certquest/content';
import { Card, CardTitle } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function ObjectivePage({ params }: { params: { certId: string; objectiveId: string } }) {
  const pack = certPacks[params.certId];
  if (!pack) notFound();
  const obj = (pack.objectives as any[]).find((o) => o.id === params.objectiveId);
  if (!obj) notFound();

  const lessons = (pack.lessons as any[]).filter((l) => l.objectiveId === obj.id);
  const flashcards = (pack.flashcards as any[]).filter((f) => f.objectiveId === obj.id);
  const questions = (pack.questionBank as any[]).filter((q) => q.objectiveId === obj.id);

  return (
    <div className="space-y-6">
      <Link href={`/certs/${params.certId}/domains/${obj.domainId}`} className="text-gold text-sm">{'< Back'}</Link>
      <div>
        <p className="text-gold text-xs tracking-[0.25em] uppercase">Objective</p>
        <h1 className="font-serif text-3xl mt-1">{obj.title}</h1>
        <p className="text-textMuted mt-2">{obj.blurb}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardTitle>Lessons</CardTitle><p className="text-2xl mt-2">{lessons.length}</p></Card>
        <Card><CardTitle>Flashcards</CardTitle><p className="text-2xl mt-2">{flashcards.length}</p></Card>
        <Card><CardTitle>Questions</CardTitle><p className="text-2xl mt-2">{questions.length}</p></Card>
      </div>
      <section>
        <h2 className="font-serif text-xl mb-3">Lessons</h2>
        <div className="grid gap-2">
          {lessons.map((l) => (
            <Card key={l.id}>
              <p className="font-semibold">{l.title}</p>
              <p className="text-textMuted text-sm mt-1">~{l.estimatedMinutes} min</p>
              {l.loreIntro && (
                <p className="text-textMuted text-xs mt-2 italic">"{l.loreIntro.mentorMessage}"</p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
