import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card, CardTitle } from '@/components/Card';

export default function ContentDevPage() {
  const stats = certDisplayOrder.map((cid) => {
    const pack = certPacks[cid]!;
    const lore = getCertLore(cid)!;
    return {
      cid, lore, pack,
      examWarnings: (pack.practiceExams as any[]).flatMap((exam) =>
        exam.domainTargets
          .filter((t: any) => {
            const avail = (pack.questionBank as any[]).filter((q) => q.domainId === t.domainId).length;
            return avail < t.questionCount;
          })
          .map((t: any) => ({ examTitle: exam.title, domainId: t.domainId, target: t.questionCount }))
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Content Dev</h1>
        <p className="text-textMuted mt-2">
          Authoring overview. In-app authoring UI is not built yet — content is currently authored
          in the codebase under <code className="bg-bgCard px-2 py-0.5 text-xs">packages/content/src/certs/</code>.
        </p>
      </div>

      <Card>
        <CardTitle>Cert Pack Inventory</CardTitle>
        <div className="mt-4 grid gap-2">
          {stats.map((s) => (
            <div key={s.cid} className="border-b border-border pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{s.pack.meta.examName}</p>
                  <p className="text-textMuted text-xs">{s.lore.worldName}</p>
                </div>
                <p className="text-gold text-xs">{s.pack.meta.examCode}</p>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2 text-xs text-textMuted">
                <span>{s.pack.lessons.length} lessons</span>
                <span>{s.pack.flashcards.length} cards</span>
                <span>{s.pack.questionBank.length} questions</span>
                <span>{s.pack.sideQuests.length} side quests</span>
                <span>{s.pack.bossBattles.length} bosses</span>
              </div>
              {s.examWarnings.length > 0 && (
                <p className="text-danger text-xs mt-2">
                  {s.examWarnings.length} exam authoring gap{s.examWarnings.length !== 1 && 's'}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Authoring Workflow</CardTitle>
        <ol className="mt-3 text-sm text-textMuted space-y-2 list-decimal list-inside">
          <li>Edit cert pack files under <code className="text-text">packages/content/src/certs/</code>.</li>
          <li>Edit lore packs under <code className="text-text">packages/content/src/lore/</code>.</li>
          <li>Run <code className="text-text">pnpm validate</code> to check schema and reference integrity.</li>
          <li>Errors block deploy. Warnings flag content gaps.</li>
        </ol>
      </Card>

      <Card>
        <CardTitle>Coming Soon</CardTitle>
        <p className="text-textMuted text-sm mt-2">
          In-app authoring UI for adding lessons, flashcards, and questions without leaving the
          dashboard. Validation runs in the browser. Drafts queue for export to the codebase.
        </p>
      </Card>
    </div>
  );
}
