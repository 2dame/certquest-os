import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card } from '@/components/Card';
import Link from 'next/link';

export default function ReviewIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Flashcard Review</h1>
        <p className="text-textMuted mt-2">
          SM-2 spaced repetition. Reviews live on the device — pick a cert to see its deck.
        </p>
      </div>
      <div className="grid gap-3">
        {certDisplayOrder.map((cid) => {
          const pack = certPacks[cid]!;
          const lore = getCertLore(cid)!;
          return (
            <Link key={cid} href={`/review/${cid}`}>
              <Card className="hover:border-gold transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
                    <p className="font-semibold mt-1">{pack.meta.examName}</p>
                    <p className="text-textMuted text-xs mt-1">{pack.flashcards.length} flashcards</p>
                  </div>
                  <p className="text-gold text-xs">VIEW {'>'}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
