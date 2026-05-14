'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { certDisplayOrder, certPacks } from '@certquest/content';
import { rankForXp } from '@certquest/gamification';
import { useStore } from '@/lib/store';

interface LeaderboardEntry {
  username: string;
  xp: number;
  streak: number;
  certId: string;
  rank: string;
}

// ── Supabase leaderboard fetch ───────────────────────────────────────────────
// Requires a `leaderboard` table in Supabase:
//   create table leaderboard (
//     user_id uuid references auth.users primary key,
//     username text,
//     xp integer default 0,
//     streak integer default 0,
//     active_cert_id text,
//     updated_at timestamptz default now()
//   );
//   alter table leaderboard enable row level security;
//   create policy "public read" on leaderboard for select using (true);
//   create policy "own write" on leaderboard for all using (auth.uid() = user_id);

async function fetchLeaderboard(certId: string | null): Promise<LeaderboardEntry[]> {
  try {
    const { getBrowserSupabase } = await import('@/lib/supabase-browser');
    const sb = getBrowserSupabase();
    if (!sb) return [];
    let query = sb
      .from('leaderboard')
      .select('username, xp, streak, active_cert_id')
      .order('xp', { ascending: false })
      .limit(25);
    if (certId) query = query.eq('active_cert_id', certId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: { username: string; xp: number; streak: number; active_cert_id: string }) => ({
      username: row.username ?? 'Anonymous',
      xp: row.xp ?? 0,
      streak: row.streak ?? 0,
      certId: row.active_cert_id ?? '',
      rank: rankForXp(row.xp ?? 0),
    }));
  } catch {
    return [];
  }
}

async function upsertMyScore(xp: number, streak: number, activeCertId: string) {
  try {
    const { getBrowserSupabase } = await import('@/lib/supabase-browser');
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    await sb.from('leaderboard').upsert({
      user_id: user.id,
      username: user.email?.split('@')[0] ?? 'Learner',
      xp,
      streak,
      active_cert_id: activeCertId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch { /* no-op if not signed in */ }
}

export default function LeaderboardPage() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const activeCertId = useStore((s) => s.activeCertId);
  const myRank = rankForXp(xp);

  const [filterCert, setFilterCert] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Sync local score to Supabase
    upsertMyScore(xp, streak.current, activeCertId).then(() => setSynced(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(filterCert).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [filterCert]);

  const myXp = xp;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-text">Leaderboard</h1>
        <p className="text-textMuted text-sm mt-2">Global XP rankings · updated live from Supabase</p>
      </div>

      {/* My stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-gold bg-bgCard p-4">
          <p className="text-gold text-[10px] tracking-widest uppercase">My XP</p>
          <p className="text-2xl font-bold text-text mt-1">{myXp.toLocaleString()}</p>
          <p className="text-textMuted text-xs mt-0.5">Rank: {myRank}</p>
        </div>
        <div className="border border-border bg-bgCard p-4">
          <p className="text-textMuted text-[10px] tracking-widest uppercase">Streak</p>
          <p className="text-2xl font-bold text-text mt-1">{streak.current}d</p>
          <p className="text-textMuted text-xs mt-0.5">Best: {streak.longest}d</p>
        </div>
        <div className="border border-border bg-bgCard p-4">
          <p className="text-textMuted text-[10px] tracking-widest uppercase">Sync</p>
          <p className="text-sm font-bold text-text mt-1">{synced ? '✓ Synced' : 'Syncing…'}</p>
          <p className="text-textMuted text-xs mt-0.5">Score pushed to global board</p>
        </div>
      </div>

      {/* Filter by cert */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCert(null)}
          className={`border px-4 py-1.5 text-xs font-bold tracking-widest transition-colors ${!filterCert ? 'border-gold text-gold' : 'border-border text-textMuted hover:border-textMuted'}`}
        >
          ALL CERTS
        </button>
        {certDisplayOrder.map((cid) => {
          const p = certPacks[cid]!;
          return (
            <button
              key={cid}
              onClick={() => setFilterCert(cid)}
              className={`border px-4 py-1.5 text-xs font-bold tracking-widest transition-colors ${filterCert === cid ? 'border-gold text-gold' : 'border-border text-textMuted hover:border-textMuted'}`}
            >
              {p.meta.examCode}
            </button>
          );
        })}
      </div>

      {/* Board */}
      <div className="border border-border">
        <div className="grid grid-cols-[2rem_1fr_6rem_5rem_5rem] gap-3 px-4 py-2 border-b border-border bg-bgElevated">
          <span className="text-textDim text-[10px] tracking-widest uppercase">#</span>
          <span className="text-textDim text-[10px] tracking-widest uppercase">Learner</span>
          <span className="text-textDim text-[10px] tracking-widest uppercase text-right">XP</span>
          <span className="text-textDim text-[10px] tracking-widest uppercase text-center">Streak</span>
          <span className="text-textDim text-[10px] tracking-widest uppercase text-center">Rank</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-textMuted text-sm">Loading…</div>
        ) : entries === null || entries.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-textMuted text-sm">No entries yet.</p>
            <p className="text-textDim text-xs">
              The leaderboard requires a Supabase <code className="font-mono">leaderboard</code> table.
              See the comment in the page source for the SQL to create it.
            </p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div
              key={i}
              className={`grid grid-cols-[2rem_1fr_6rem_5rem_5rem] gap-3 px-4 py-3 border-b border-border last:border-0 ${i === 0 ? 'bg-gold/5' : 'bg-bgCard hover:bg-bgElevated'} transition-colors`}
            >
              <span className={`text-sm font-mono font-bold ${i === 0 ? 'text-gold' : i < 3 ? 'text-textMuted' : 'text-textDim'}`}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-text text-sm font-semibold truncate">{e.username}</p>
                {e.certId && <p className="text-textDim text-[10px]">{certPacks[e.certId]?.meta.examCode ?? e.certId}</p>}
              </div>
              <span className="text-gold font-mono text-sm text-right self-center">{e.xp.toLocaleString()}</span>
              <span className="text-textMuted text-sm text-center self-center">{e.streak}d</span>
              <span className="text-textDim text-xs text-center self-center">{e.rank}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Link href="/settings" className="border border-border text-textMuted text-xs font-bold tracking-widest px-5 py-2.5 hover:border-textMuted transition-colors">
          SETTINGS
        </Link>
        <Link href="/dashboard" className="border border-border text-textMuted text-xs font-bold tracking-widest px-5 py-2.5 hover:border-textMuted transition-colors">
          DASHBOARD
        </Link>
      </div>
    </div>
  );
}
