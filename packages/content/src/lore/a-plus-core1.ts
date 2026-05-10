import type { CertLore } from '@certquest/types/src/lore-schemas';

export const aPlusCore1Lore: CertLore = {
  worldName: 'The Help Desk Guild',
  userRole: 'Rookie Hardware Recruit',
  tagline: 'Every ticket is a dragon. Every cable is a clue.',
  tone: 'Tactical, focused, slightly gritty. Veteran techs joking through their fifth coffee.',
  mentor: {
    name: 'Captain Byte',
    title: 'Guildmaster of the Help Desk',
    voice: 'Direct, dry, cuts to the diagnosis. No filler.',
    catchphrase: 'Power. Display. Storage. Memory. In that order.',
  },
  rival: {
    name: 'The Ticket Queue',
    title: 'The Endless Backlog',
    purpose: 'Grows faster than rookies can clear it. Forces you to get faster, more accurate, and more decisive.',
  },
  regions: [
    {
      domainId: 'aplus-c1-mobile',
      regionName: 'Device Dock',
      description: 'Where laptops, tablets, and smartphones come in broken and leave fixed.',
      threat: 'Failed digitizers, dead backlights, swollen batteries.',
      unlockMessage: 'The Device Dock opens. The first laptop is already smoking.',
      completionMessage: 'You can identify any mobile component by symptom alone. The Dock respects you.',
    },
    {
      domainId: 'aplus-c1-network',
      regionName: 'Cable Catacombs',
      description: 'Underground tunnels of patch panels, mystery cables, and dead drops.',
      threat: 'Cat 5e where Cat 6a should be. Untraceable runs. Bent fiber.',
      unlockMessage: 'Bring a tone generator. The Catacombs have eaten three rookies this month.',
      completionMessage: 'You read cabling like a map. The Catacombs are charted.',
    },
    {
      domainId: 'aplus-c1-hardware',
      regionName: 'Hardware Hall',
      description: 'The main workshop. Every desktop in the guild passes through here.',
      threat: 'Bad RAM. Failing PSUs. Mismatched DIMMs.',
      unlockMessage: 'Captain Byte slides you a screwdriver. "Show me you can tell DDR4 from DDR5 by feel."',
      completionMessage: 'You build, diagnose, and rebuild without thinking. The Hall is yours.',
    },
    {
      domainId: 'aplus-c1-cloud',
      regionName: 'Cloud Outpost',
      description: 'Where the Guild meets the sky. A small post but a critical one.',
      threat: 'Confusing SaaS with PaaS in a deployment plan. Wasted spend. Misconfigured access.',
      unlockMessage: 'The Outpost\'s envoy hands you a tablet. "Tell me what kind of cloud Salesforce is."',
      completionMessage: 'You know which cloud model fits which problem. The Outpost trusts you.',
    },
    {
      domainId: 'aplus-c1-troubleshoot',
      regionName: 'Troubleshooting Arena',
      description: 'Where rookies prove they can think, not just guess.',
      threat: 'Skipping steps. Fixing without verifying. Failing to document.',
      unlockMessage: 'Six steps. You know them. Now run them while three users yell at you.',
      completionMessage: 'You think before you touch. The Arena names you a tactician.',
    },
  ],
  rankTitles: ['Recruit', 'Apprentice', 'Operator', 'Specialist', 'Tactician', 'Guild Architect', 'Guildmaster'],
  dailyMessageTemplates: [
    'Three tickets are already in queue. {nextLesson} first — that pattern keeps showing up.',
    'The Queue is rising. {dueReviews} reviews waiting. Drill before the next wave.',
    'Captain Byte: "{weakDomain} is bleeding. Patch it before the trial."',
    'Quiet morning. Take it. Run a quick quiz on {weakDomain}.',
    'You are at {readiness}% Trial Readiness. The {nextTrial} unlocks at 80%.',
  ],
};
