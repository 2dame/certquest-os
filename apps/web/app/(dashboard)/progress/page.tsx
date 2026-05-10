import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { CORE_BADGES } from '@certquest/gamification';
import { Card, CardTitle } from '@/components/Card';

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Progress</h1>
        <p className="text-textMuted mt-2">
          Progress lives on the device. The web view is a read-only mirror — open the mobile app
          for live counts.
        </p>
      </div>

      <section>
        <h2 className="font-serif text-2xl mb-4">Readiness by Cert</h2>
        <div className="grid gap-3">
          {certDisplayOrder.map((cid) => {
            const pack = certPacks[cid]!;
            const lore = getCertLore(cid)!;
            return (
              <Card key={cid}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
                    <p className="font-semibold mt-1">{pack.meta.examName}</p>
                    <p className="text-textMuted text-xs mt-1">{pack.meta.examCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-textMuted tracking-[0.2em] uppercase mt-1">Sync from mobile</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {CORE_BADGES.map((b) => (
            <Card key={b.id} className="opacity-60">
              <p className="font-semibold">{b.name}</p>
              <p className="text-textMuted text-xs italic mt-1">{b.loreTitle}</p>
              <p className="text-textMuted text-xs mt-2">{b.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Weak Areas</h2>
        <p className="text-textMuted text-sm">
          Weak-area detection runs on the device. Open the mobile app's Progress tab to see live
          weak areas with region/threat context.
        </p>
      </section>
    </div>
  );
}
