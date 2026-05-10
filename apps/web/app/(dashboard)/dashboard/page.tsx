import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { Card, CardHeader, CardTitle } from '@/components/Card';
import { getServerSupabase } from '@/lib/supabase-server';
import { CertSelector } from './CertSelector';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = getServerSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  // Read user's active cert from Supabase metadata; fall back to first cert.
  const activeCertId: string =
    (user?.user_metadata?.activeCertId as string | undefined) ?? certDisplayOrder[0] ?? 'a-plus-core1';

  const pack = certPacks[activeCertId]!;
  const lore = getCertLore(activeCertId)!;
  const nextLesson = pack.lessons[0];
  const nextObjective = pack.objectives.find((o) => o.id === nextLesson?.objectiveId);
  const region = lore.regions.find((r) => r.domainId === nextObjective?.domainId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName}</p>
          <h1 className="font-serif text-4xl mt-1">{pack.meta.examName}</h1>
          <p className="text-textMuted italic mt-2">You are: {lore.userRole}</p>
        </div>
        <CertSelector activeCertId={activeCertId} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardTitle>Trial Readiness</CardTitle>
          <p className="text-3xl font-bold text-gold mt-2">0%</p>
          <p className="text-textMuted text-xs mt-1">Local-only readiness. Open the mobile app to record progress.</p>
        </Card>
        <Card>
          <CardTitle>Active Cert</CardTitle>
          <p className="text-2xl font-bold mt-2">{pack.meta.examCode}</p>
          <p className="text-textMuted text-xs mt-1">{pack.lessons.length} lessons · {pack.questionBank.length} questions</p>
        </Card>
        <Card>
          <CardTitle>Mentor</CardTitle>
          <p className="text-xl mt-2">{lore.mentor.name}</p>
          <p className="text-textMuted text-xs mt-1 italic">"{lore.mentor.catchphrase}"</p>
        </Card>
      </div>

      {region && (
        <Card>
          <CardHeader>
            <CardTitle>Current Region</CardTitle>
          </CardHeader>
          <p className="text-2xl font-serif">{region.regionName}</p>
          <p className="text-textMuted mt-2">{region.description}</p>
          <p className="text-danger text-sm mt-3">Threat: {region.threat}</p>
        </Card>
      )}

      <Card accent>
        <CardHeader>
          <CardTitle>Next Training</CardTitle>
        </CardHeader>
        {nextLesson ? (
          <>
            <p className="text-xl font-serif">{nextLesson.title}</p>
            <p className="text-textMuted text-sm mt-1">{nextObjective?.title} · ~{nextLesson.estimatedMinutes} min</p>
            <Link href={`/certs/${activeCertId}`} className="inline-block mt-4 px-5 py-2 bg-gold text-bg font-semibold tracking-wider text-sm">
              VIEW CERT
            </Link>
          </>
        ) : (
          <p className="text-textMuted">All caught up.</p>
        )}
      </Card>

      <div>
        <p className="text-text text-xs tracking-[0.25em] uppercase mb-3">Other Cert Paths</p>
        <div className="grid grid-cols-2 gap-3">
          {certDisplayOrder.filter((id) => id !== activeCertId).map((cid) => {
            const p = certPacks[cid]!;
            const l = getCertLore(cid)!;
            return (
              <Link key={cid} href={`/certs/${cid}`} className="border border-border bg-bgCard p-4 hover:border-gold transition">
                <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{l.worldName}</p>
                <p className="font-semibold mt-1">{p.meta.examName}</p>
                <p className="text-textMuted text-xs mt-1">{p.meta.examCode}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
