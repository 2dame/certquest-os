import { certPacks, getCertLore } from '@certquest/content';
import { Card } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function ReviewCertPage({ params }: { params: { certId: string } }) {
  const pack = certPacks[params.certId];
  const lore = getCertLore(params.certId);
  if (!pack || !lore) notFound();

  const byKind: Record<string, number> = {};
  for (const fc of pack.flashcards as any[]) {
    byKind[fc.kind ?? 'basic'] = (byKind[fc.kind ?? 'basic'] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <Link href="/review" className="text-gold text-sm">{'< Back'}</Link>
      <div>
        <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName}</p>
        <h1 className="font-serif text-3xl mt-1">{pack.meta.examName} — Flashcard Deck</h1>
        <p className="text-textMuted text-sm mt-1">{pack.flashcards.length} cards total</p>
      </div>
      <Card>
        <p className="font-semibold mb-3">By Type</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Object.entries(byKind).map(([kind, count]) => (
            <div key={kind} className="border border-border p-3">
              <p className="text-gold text-[10px] tracking-[0.2em] uppercase">{kind}</p>
              <p className="text-xl mt-1">{count}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="font-semibold mb-3">Sample Cards</p>
        <div className="space-y-3">
          {(pack.flashcards as any[]).slice(0, 5).map((fc) => (
            <div key={fc.id} className="border-b border-border pb-2">
              <p className="text-text">{fc.front}</p>
              <p className="text-textMuted text-sm mt-1">{fc.back}</p>
            </div>
          ))}
        </div>
        <p className="text-textMuted text-xs mt-4 italic">
          Open the mobile app to review the full deck with SM-2 scheduling.
        </p>
      </Card>
    </div>
  );
}
