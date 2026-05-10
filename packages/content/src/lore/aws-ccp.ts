import type { CertLore } from '@certquest/types/src/lore-schemas';

export const awsCcpLore: CertLore = {
  worldName: 'Cloud Village',
  userRole: 'Cloud Initiate',
  tagline: 'A village in the sky. Each building is a service. Learn what each one does before you build.',
  tone: 'Calm, almost monastic. Patient teaching. Clarity over cleverness.',
  mentor: {
    name: 'Sage Nimbus',
    title: 'Keeper of the Cloud Village',
    voice: 'Soft-spoken, deliberate. Answers questions with better questions.',
    catchphrase: 'Security of the cloud. Security in the cloud. Two different villages.',
  },
  rival: {
    name: 'The Billing Fog',
    title: 'The Mist That Hides the Bill',
    purpose: 'Rolls in at month-end. Conceals which services are running. Punishes initiates who do not tag resources.',
  },
  regions: [
    {
      domainId: 'ccp-concepts',
      regionName: 'Cloud Value Plaza',
      description: 'The center of the village. Where initiates learn why anyone moves to the cloud at all.',
      threat: 'Buzzwords without meaning. Migrations without a reason.',
      unlockMessage: 'Sage Nimbus asks: "Why does your company want this?" Have an answer ready.',
      completionMessage: 'You can name three concrete benefits without saying "elasticity." The Plaza nods.',
    },
    {
      domainId: 'ccp-security',
      regionName: 'Shared Responsibility Court',
      description: 'A circular courtroom. AWS sits on one side. The customer sits on the other. The line between them is the entire test.',
      threat: 'Believing AWS patches your EC2 instance. Believing the customer manages the hypervisor.',
      unlockMessage: 'Stand on the customer side. Sage Nimbus will ask you who patches what.',
      completionMessage: 'You can sort any task to the correct side without thinking. The Court rises.',
    },
    {
      domainId: 'ccp-tech',
      regionName: 'S3 Shrine',
      description: 'The most-visited shrine in the village. Eleven nines of durability. Object storage that doubles as a website.',
      threat: 'Confusing S3 with EBS. Choosing the wrong storage class for the access pattern.',
      unlockMessage: 'The Shrine accepts objects. It does not accept blocks. Know the difference.',
      completionMessage: 'You match the storage class to the workload on instinct. The Shrine glows.',
    },
    {
      domainId: 'ccp-billing',
      regionName: 'Billing Bazaar',
      description: 'A noisy market. Reserved Instances, Savings Plans, Spot, On-Demand — each vendor swears theirs is cheapest.',
      threat: 'Picking Spot for production. Picking On-Demand for a 24/7 workload running for years.',
      unlockMessage: 'The Fog is heaviest here. Tag everything. Question every quote.',
      completionMessage: 'You match pricing to workload without checking notes. The Bazaar quiets.',
    },
  ],
  rankTitles: ['Initiate', 'Acolyte', 'Adept', 'Cloud Citizen', 'Keeper', 'Sage', 'Cloud Master'],
  dailyMessageTemplates: [
    'The Fog is light today. {nextLesson} is the path forward.',
    'Sage Nimbus notes: "{weakDomain} is where most initiates falter."',
    '{dueReviews} review cards waiting at the Shrine.',
    'Trial Readiness: {readiness}%. The {nextTrial} opens at 80%.',
    'The Bazaar is open. Quiz on pricing models. Five minutes.',
  ],
};
