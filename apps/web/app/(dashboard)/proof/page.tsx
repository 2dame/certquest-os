import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card, CardTitle } from '@/components/Card';

export default function ProofPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Proof</h1>
        <p className="text-textMuted mt-2">
          Evidence of work across all cert paths. Each objective tracks: mastery, last evidence
          timestamp, lessons completed, and questions answered.
        </p>
      </div>

      {certDisplayOrder.map((cid) => {
        const pack = certPacks[cid]!;
        const lore = getCertLore(cid)!;
        return (
          <Card key={cid}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
                <p className="font-semibold mt-1">{pack.meta.examName}</p>
              </div>
              <p className="text-textMuted text-xs">{pack.objectives.length} objectives</p>
            </div>
            <div className="space-y-1">
              {(pack.objectives as any[]).map((obj) => {
                const lessons = (pack.lessons as any[]).filter((l) => l.objectiveId === obj.id);
                const questions = (pack.questionBank as any[]).filter((q) => q.objectiveId === obj.id);
                return (
                  <div key={obj.id} className="flex justify-between items-center border-b border-border pb-1.5 text-sm">
                    <span className="flex-1">{obj.title}</span>
                    <span className="text-textMuted text-xs ml-3">
                      {lessons.length}L · {questions.length}Q
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <Card>
        <CardTitle>How Proof Works</CardTitle>
        <p className="text-textMuted text-sm mt-2 leading-relaxed">
          Mastery moves up when you complete lessons, answer questions correctly, pass mini-games,
          and clear boss battles. Mastery moves down on missed questions and stale objectives.
          Live mastery values stream from the device — open the mobile app for current numbers.
        </p>
      </Card>
    </div>
  );
}
