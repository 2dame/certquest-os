import { certPacks, getCertLore } from '@certquest/content';
import { Card } from '@/components/Card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function DomainPage({ params }: { params: { certId: string; domainId: string } }) {
  const pack = certPacks[params.certId];
  const lore = getCertLore(params.certId);
  if (!pack || !lore) notFound();
  const domain = (pack.domains as any[]).find((d) => d.id === params.domainId);
  const region = lore.regions.find((r) => r.domainId === params.domainId);
  if (!domain) notFound();

  const objectives = (pack.objectives as any[]).filter((o) => o.domainId === params.domainId);

  return (
    <div className="space-y-6">
      <Link href={`/certs/${params.certId}`} className="text-gold text-sm">{'< Back'}</Link>
      <div>
        <p className="text-gold text-xs tracking-[0.25em] uppercase">{region?.regionName}</p>
        <h1 className="font-serif text-3xl mt-1">{domain.title}</h1>
        <p className="text-textMuted text-sm mt-1">{Math.round(domain.weight * 100)}% of exam</p>
        {region && (
          <>
            <p className="text-text italic mt-3">{region.description}</p>
            <p className="text-danger text-sm mt-2">Threat: {region.threat}</p>
          </>
        )}
      </div>
      <h2 className="font-serif text-xl">Objectives</h2>
      <div className="grid gap-2">
        {objectives.map((obj) => (
          <Link key={obj.id} href={`/certs/${params.certId}/objectives/${obj.id}`}>
            <Card className="hover:border-gold transition">
              <p className="font-semibold">{obj.title}</p>
              <p className="text-textMuted text-sm mt-1">{obj.blurb}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
