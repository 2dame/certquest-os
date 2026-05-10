import type { Rank } from '@certquest/types';

// Each level requires more XP than the last. Curve is gentle early, steeper later.
// XP-to-next-level: 100 * level^1.5
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

export function levelFromTotalXp(totalXp: number): { level: number; xpInLevel: number; xpToNext: number } {
  let level = 1;
  let consumed = 0;
  while (consumed + xpForLevel(level) <= totalXp) {
    consumed += xpForLevel(level);
    level += 1;
  }
  return {
    level,
    xpInLevel: totalXp - consumed,
    xpToNext: xpForLevel(level),
  };
}

const RANK_THRESHOLDS: Array<{ level: number; rank: Rank }> = [
  { level: 1, rank: 'Recruit' },
  { level: 5, rank: 'Apprentice' },
  { level: 10, rank: 'Operator' },
  { level: 18, rank: 'Specialist' },
  { level: 28, rank: 'Tactician' },
  { level: 40, rank: 'Architect' },
  { level: 55, rank: 'Master' },
];

export function rankForLevel(level: number): Rank {
  let rank: Rank = 'Recruit';
  for (const t of RANK_THRESHOLDS) {
    if (level >= t.level) rank = t.rank;
  }
  return rank;
}
