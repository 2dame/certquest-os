import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card } from '@/components/Card';
import Link from 'next/link';

export default function PracticeIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Practice</h1>
        <p className="text-textMuted mt-2">Quick quizzes and practice exam blueprints across all cert paths.</p>
      </div>

      {/* Mixed quiz CTA */}
      <Link
        href="/quiz/mixed"
        className="flex items-center justify-between p-4 border-2 border-gold bg-bgCard hover:bg-bgElevated transition group"
      >
        <div>
          <p className="text-gold text-[10px] tracking-widest uppercase">Multi-Cert Mix</p>
          <p className="text-text font-semibold mt-1">Mixed Study Session</p>
          <p className="text-textMuted text-xs mt-0.5">Draw questions from multiple certs in one 15-question session</p>
        </div>
        <span className="text-gold text-xl group-hover:translate-x-1 transition-transform">→</span>
      </Link>

      <div className="grid gap-4">
        {certDisplayOrder.map((cid) => {
          const pack = certPacks[cid]!;
          const lore = getCertLore(cid)!;
          return (
            <Card key={cid}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
                  <p className="font-semibold mt-1">{pack.meta.examName}</p>
                  <p className="text-textMuted text-xs mt-1">
                    {pack.questionBank.length} questions · {pack.practiceExams.length} exam blueprint{pack.practiceExams.length !== 1 && 's'}
                  </p>
                </div>
                <Link href={`/practice/${cid}`} className="text-gold text-xs tracking-[0.25em]">VIEW {'>'}</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
