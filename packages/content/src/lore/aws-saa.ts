import type { CertLore } from '@certquest/types/src/lore-schemas';

export const awsSaaLore: CertLore = {
  worldName: 'The Architect Trials',
  userRole: 'Cloud Architect Candidate',
  tagline: 'Every trial is a real architecture decision under constraints. Survive enough trials, earn the title.',
  tone: 'Serious, high-stakes. Council chambers and quiet pressure.',
  mentor: {
    name: 'Master Well-Arch',
    title: 'Chair of the Well-Architected Council',
    voice: 'Measured, demanding, never satisfied with the first answer.',
    catchphrase: 'Resilient. Performant. Secure. Cost-aware. In every decision.',
  },
  rival: {
    name: 'The Cost Dragon',
    title: 'The Beast That Eats Margins',
    purpose: 'Hoards billing surprises. Burns architects who do not right-size. Grows fat on idle resources.',
  },
  regions: [
    {
      domainId: 'saa-resilient',
      regionName: 'Multi-AZ Fortress',
      description: 'A fortress with redundant gates. If one falls, the others hold.',
      threat: 'Single points of failure. Confusing read replicas with multi-AZ.',
      unlockMessage: 'The Council asks: "If this AZ fails, what survives?" Answer in services, not slogans.',
      completionMessage: 'Your designs survive AZ failure without thinking. The Fortress holds.',
    },
    {
      domainId: 'saa-perf',
      regionName: 'Auto Scaling Arena',
      description: 'Where workloads grow and shrink under load. The Arena tests whether your design breathes.',
      threat: 'Static fleet sizes. Wrong instance families. EBS picked by habit, not workload.',
      unlockMessage: 'The Arena scales the load to break you. Design something that bends, not breaks.',
      completionMessage: 'You pick storage and compute by access pattern. The Arena yields.',
    },
    {
      domainId: 'saa-secure',
      regionName: 'IAM Labyrinth',
      description: 'A maze of policies, roles, and trust relationships. Wrong turn and you grant the world your data.',
      threat: 'Wildcard permissions. Hardcoded keys. Cross-account access without external IDs.',
      unlockMessage: 'The Labyrinth has one rule: explicit deny always wins. Memorize it.',
      completionMessage: 'You write least-privilege policies that work the first time. The Labyrinth opens.',
    },
    {
      domainId: 'saa-cost',
      regionName: 'Cost Control Keep',
      description: 'A high tower where every running resource is visible. The Dragon cannot hide here.',
      threat: 'Untagged resources. Forgotten test environments. Spot for production workloads.',
      unlockMessage: 'The Keep demands tags on every resource. Tag everything before the Dragon arrives.',
      completionMessage: 'You optimize cost without breaking resilience. The Keep stands.',
    },
  ],
  rankTitles: ['Candidate', 'Apprentice Architect', 'Architect', 'Senior Architect', 'Principal', 'Council Member', 'Chair'],
  dailyMessageTemplates: [
    'The Council convenes. {nextLesson} is today\'s case.',
    'Master Well-Arch flagged {weakDomain}. Drill before the next trial.',
    'The Dragon stirs. {dueReviews} cost-optimization cards waiting.',
    'Trial Readiness: {readiness}%. The {nextTrial} unlocks at 80%.',
    'A scenario waits in the Arena. Five questions. Choose carefully.',
  ],
};
