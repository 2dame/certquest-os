'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { certPacks, getCertLore, certDisplayOrder } from '@certquest/content';

export default function GlossaryPage() {
  const { certId } = useParams<{ certId: string }>();
  const pack = certPacks[certId ?? ''];
  const lore = getCertLore(certId ?? '');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'glossary' | 'acronyms'>('glossary');

  const filteredGlossary = useMemo(() => {
    if (!pack) return [];
    const q = query.toLowerCase();
    if (!q) return pack.glossary ?? [];
    return (pack.glossary ?? []).filter(
      (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
    );
  }, [pack, query]);

  const filteredAcronyms = useMemo(() => {
    if (!pack) return [];
    const q = query.toLowerCase();
    if (!q) return pack.acronyms ?? [];
    return (pack.acronyms ?? []).filter(
      (a) =>
        a.acronym.toLowerCase().includes(q) ||
        a.expansion.toLowerCase().includes(q) ||
        (a.meaning ?? '').toLowerCase().includes(q)
    );
  }, [pack, query]);

  if (!pack || !lore) {
    return <div className="flex items-center justify-center h-64"><p className="text-textMuted">Cert not found.</p></div>;
  }

  const glossaryCount = (pack.glossary ?? []).length;
  const acronymCount = (pack.acronyms ?? []).length;

  // Group glossary terms alphabetically
  const grouped = useMemo(() => {
    const map: Record<string, typeof filteredGlossary> = {};
    for (const g of filteredGlossary) {
      const key = g.term[0]?.toUpperCase() ?? '#';
      (map[key] ??= []).push(g);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredGlossary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-gold text-xs tracking-[0.25em] uppercase">{lore.worldName}</p>
          <h1 className="font-serif text-4xl mt-1 text-text">Reference Library</h1>
          <p className="text-textMuted text-sm mt-1">{glossaryCount} terms · {acronymCount} acronyms</p>
        </div>
        <div className="flex gap-2">
          {certDisplayOrder.map((cid) => {
            const p = certPacks[cid]!;
            return (
              <Link
                key={cid}
                href={`/glossary/${cid}`}
                className={`border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                  cid === certId ? 'border-gold text-gold' : 'border-border text-textMuted hover:border-textMuted'
                }`}
              >
                {p.meta.examCode}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search + tabs */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, definitions, acronyms…"
          className="flex-1 border border-border bg-bgCard text-text text-sm px-4 py-2.5 focus:outline-none focus:border-gold transition-colors placeholder:text-textMuted"
        />
        <div className="flex border border-border">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2.5 text-xs font-bold tracking-widest transition-colors ${
              activeTab === 'glossary' ? 'bg-bgCard text-gold' : 'text-textMuted hover:text-text'
            }`}
          >
            GLOSSARY
          </button>
          <button
            onClick={() => setActiveTab('acronyms')}
            className={`px-4 py-2.5 text-xs font-bold tracking-widest border-l border-border transition-colors ${
              activeTab === 'acronyms' ? 'bg-bgCard text-gold' : 'text-textMuted hover:text-text'
            }`}
          >
            ACRONYMS
          </button>
        </div>
      </div>

      {/* Glossary tab */}
      {activeTab === 'glossary' && (
        <div>
          {filteredGlossary.length === 0 ? (
            <p className="text-textMuted text-sm italic p-8 border border-border text-center">
              {query ? 'No terms match your search.' : 'No glossary terms available for this cert yet.'}
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([letter, terms]) => (
                <div key={letter}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gold font-serif text-2xl font-bold w-8">{letter}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-1">
                    {terms.map((g) => (
                      <div key={g.term} className="border border-border bg-bgCard p-4 flex gap-6">
                        <p className="text-text font-semibold text-sm w-48 shrink-0">{g.term}</p>
                        <p className="text-textMuted text-sm leading-relaxed">{g.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Acronyms tab */}
      {activeTab === 'acronyms' && (
        <div>
          {filteredAcronyms.length === 0 ? (
            <p className="text-textMuted text-sm italic p-8 border border-border text-center">
              {query ? 'No acronyms match your search.' : 'No acronyms available for this cert yet.'}
            </p>
          ) : (
            <div className="border border-border divide-y divide-border">
              {filteredAcronyms.map((a) => (
                <div key={a.acronym} className="flex items-start gap-6 p-4 bg-bgCard hover:bg-bgElevated transition-colors">
                  <p className="text-gold font-mono font-bold text-sm w-24 shrink-0 tabular-nums">{a.acronym}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-semibold">{a.expansion}</p>
                    {a.meaning && <p className="text-textMuted text-xs mt-0.5 leading-relaxed">{a.meaning}</p>}
                  </div>
                  <Link
                    href={`/acronyms/${certId}`}
                    className="text-textDim text-[10px] tracking-widest hover:text-gold transition-colors shrink-0 mt-0.5"
                  >
                    DRILL →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Link href={`/acronyms/${certId}`} className="border border-gold text-gold text-xs font-bold tracking-widest px-5 py-2.5 hover:bg-gold/10 transition-colors">
          ACRONYM DRILL →
        </Link>
        <Link href="/dashboard" className="border border-border text-textMuted text-xs font-bold tracking-widest px-5 py-2.5 hover:border-textMuted transition-colors">
          DASHBOARD
        </Link>
      </div>
    </div>
  );
}
