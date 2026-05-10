import { certPacks, certGroups, getCertLore } from '@certquest/content';
import Link from 'next/link';

export default function CertsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Cert Paths</h1>
        <p className="text-textMuted mt-2">Five paths. Each is its own world.</p>
      </div>
      {certGroups.map((group) => (
        <section key={group.id} className="space-y-3">
          <h2 className="font-serif text-2xl">{group.title}</h2>
          <p className="text-textMuted text-sm">{group.blurb}</p>
          <div className="grid gap-3">
            {group.certIds.map((cid) => {
              const pack = certPacks[cid]!;
              const lore = getCertLore(cid)!;
              return (
                <Link key={cid} href={`/certs/${cid}`}
                  className="block border border-border bg-bgCard p-5 hover:border-gold transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gold text-[10px] tracking-[0.25em] uppercase">{lore.worldName}</p>
                      <p className="font-semibold mt-1">{pack.meta.examName}</p>
                      <p className="text-textMuted text-xs mt-1">{pack.meta.examCode} · {pack.lessons.length} lessons · {pack.questionBank.length} questions</p>
                    </div>
                    <p className="text-gold text-sm">{'>'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {lore.regions.map((r) => (
                      <span key={r.domainId} className="text-[10px] text-textMuted border border-border px-2 py-0.5">
                        {r.regionName}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
