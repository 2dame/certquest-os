import type { CertLore } from '@certquest/types/src/lore-schemas';

export const aPlusCore2Lore: CertLore = {
  worldName: 'The Field Support Order',
  userRole: 'Field Support Operative',
  tagline: 'The hardware was the easy part. Now the software fights back.',
  tone: 'Field-ops urgency. Calm under pressure. Procedure-driven.',
  mentor: {
    name: 'Agent Patch',
    title: 'Field Operations Lead',
    voice: 'Methodical, never rushed, always one step ahead of the malware.',
    catchphrase: 'Quarantine first. Diagnose second. Document always.',
  },
  rival: {
    name: 'The Chaos Log',
    title: 'The Errors That Refuse to Repeat',
    purpose: 'Generates intermittent failures that disappear when you watch and reappear when you blink.',
  },
  regions: [
    {
      domainId: 'aplus-c2-os',
      regionName: 'OS Citadel',
      description: 'A fortress of operating systems. Windows, macOS, Linux — every wing has its own rules.',
      threat: 'Corrupted system files. Group Policy lockouts. Profile corruption.',
      unlockMessage: 'Agent Patch hands you a console. "sfc and DISM. In that order if sfc fails."',
      completionMessage: 'The Citadel\'s commands answer to you. The OS no longer fights back.',
    },
    {
      domainId: 'aplus-c2-security',
      regionName: 'Security Ward',
      description: 'Where social engineers, ransomware authors, and tailgaters are studied and stopped.',
      threat: 'Vishing calls. Ransomware notes. Badge-door followers.',
      unlockMessage: 'Five marketing laptops just locked. The Ward needs you.',
      completionMessage: 'You spot the attack before the user clicks. The Ward stands.',
    },
    {
      domainId: 'aplus-c2-software',
      regionName: 'Troubleshooting Alley',
      description: 'Narrow streets where intermittent crashes hide between normal operations.',
      threat: 'Apps that freeze only on Tuesdays. Updates that brick drivers.',
      unlockMessage: 'The Alley is where rookies become operatives. Or quit.',
      completionMessage: 'No crash escapes you twice. The Alley clears.',
    },
    {
      domainId: 'aplus-c2-ops',
      regionName: 'Operations Desk',
      description: 'Change requests, rollback plans, documentation. The discipline that holds the Order together.',
      threat: 'Skipped change reviews. Missing rollback plans. Undocumented fixes.',
      unlockMessage: 'Agent Patch slides you a CMDB. "Update it after every move. Every move."',
      completionMessage: 'You document like an auditor and execute like a field op. The Desk respects you.',
    },
  ],
  rankTitles: ['Recruit', 'Operative', 'Specialist', 'Senior Operative', 'Field Lead', 'Operations Captain', 'Order Commander'],
  dailyMessageTemplates: [
    'A ransomware note just hit two laptops. {nextLesson} covers exactly this protocol.',
    'Agent Patch flagged {weakDomain} as your soft spot. Drill it.',
    '{dueReviews} review cards waiting. Run them between calls.',
    'Quiet shift. Use it. The {nextTrial} won\'t wait.',
    'Trial Readiness: {readiness}%. Three more boss battles and the Order considers you field-ready.',
  ],
};
