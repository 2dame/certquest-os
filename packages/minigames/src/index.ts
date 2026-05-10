/**
 * Mini-game engine. Pure logic — no React, no I/O.
 * The mobile app imports gradeMiniGameAttempt() and renders templates.
 */

export type MiniGameTemplate =
  | 'cable_crafter'
  | 'port_lockpick'
  | 'osi_tower'
  | 'subnet_sprint'
  | 'packet_detective'
  | 'cloud_architect'
  | 'cli_dojo'
  | 'service_sorter'
  | 'troubleshooting_sequence'
  | 'acronym_blitz';

export interface MiniGameItem {
  id: string;
  prompt: string;
  answer: string;
  distractors?: string[];
  explanation?: string;
}

export interface MiniGamePayload {
  template: MiniGameTemplate;
  passThreshold: number; // percent, 0-100
  timeLimitSeconds?: number;
  items: MiniGameItem[];
}

export interface MiniGameAttempt {
  template: MiniGameTemplate;
  responses: Array<{ itemId: string; answer: string }>;
  timeUsedSeconds: number;
}

export interface MiniGameResult {
  template: MiniGameTemplate;
  totalItems: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  missed: Array<{ itemId: string; prompt: string; submitted: string; correct: string; explanation?: string }>;
  xpEarned: number;
  masteryDelta: number; // 0..1, applied to objective mastery
  timeUsedSeconds: number;
}

/** Grade a mini-game attempt. Pure function. */
export function gradeMiniGameAttempt(payload: MiniGamePayload, attempt: MiniGameAttempt): MiniGameResult {
  const responseMap = new Map(attempt.responses.map((r) => [r.itemId, r.answer]));
  const missed: MiniGameResult['missed'] = [];
  let correctCount = 0;

  for (const item of payload.items) {
    const submitted = (responseMap.get(item.id) ?? '').trim();
    if (matches(submitted, item.answer)) {
      correctCount++;
    } else {
      missed.push({
        itemId: item.id,
        prompt: item.prompt,
        submitted: submitted || '(no answer)',
        correct: item.answer,
        explanation: item.explanation,
      });
    }
  }

  const totalItems = payload.items.length;
  const scorePercent = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const passed = scorePercent >= payload.passThreshold;

  return {
    template: payload.template,
    totalItems,
    correctCount,
    scorePercent,
    passed,
    missed,
    xpEarned: getMiniGameXpAward(payload.template, scorePercent, passed),
    masteryDelta: getMiniGameMasteryDelta(payload.template, scorePercent, passed),
    timeUsedSeconds: attempt.timeUsedSeconds,
  };
}

function matches(submitted: string, correct: string): boolean {
  return submitted.toLowerCase().replace(/\s+/g, ' ').trim() ===
         correct.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Per-template XP awards. Higher for harder templates. */
export function getMiniGameXpAward(template: MiniGameTemplate, scorePercent: number, passed: boolean): number {
  const base: Record<MiniGameTemplate, number> = {
    cable_crafter: 25,
    port_lockpick: 30,
    osi_tower: 40,
    subnet_sprint: 50,
    packet_detective: 45,
    cloud_architect: 55,
    cli_dojo: 50,
    service_sorter: 30,
    troubleshooting_sequence: 45,
    acronym_blitz: 25,
  };
  const baseXp = base[template];
  if (!passed) return Math.round(baseXp * 0.25); // partial credit for trying
  // Scale XP by score: 80% = base, 100% = base * 1.5
  const multiplier = 0.5 + (scorePercent / 100);
  return Math.round(baseXp * multiplier);
}

/** Mastery delta is small — readiness is a long-term signal. */
export function getMiniGameMasteryDelta(template: MiniGameTemplate, scorePercent: number, passed: boolean): number {
  if (!passed) return 0.01;
  // 0.03 to 0.08 per mini-game pass, scaled by score
  return Math.min(0.08, 0.03 + (scorePercent / 100) * 0.05);
}

/** Human-readable instructions per template. Mobile shell calls this. */
export function getMiniGameInstructions(template: MiniGameTemplate): string {
  switch (template) {
    case 'cable_crafter': return 'Match each cable type to its correct use. The Cable Catacombs do not forgive guesses.';
    case 'port_lockpick': return 'Pick the right port for each protocol. Numbers, not names.';
    case 'osi_tower': return 'Assign each item to its OSI layer. Floor 1 to Floor 7.';
    case 'subnet_sprint': return 'Calculate subnet details. Speed matters, but accuracy matters more.';
    case 'packet_detective': return 'Read the packet capture. Identify the protocol and the problem.';
    case 'cloud_architect': return 'Match the workload to the right AWS service. Architecture decisions under constraints.';
    case 'cli_dojo': return 'Pick the correct Cisco IOS command for each scenario. Mode first, command second.';
    case 'service_sorter': return 'Sort each task to AWS or Customer responsibility. The Court is watching.';
    case 'troubleshooting_sequence': return 'Order the troubleshooting steps. CompTIA methodology, in sequence.';
    case 'acronym_blitz': return 'Expand each acronym. Speed round.';
  }
}
