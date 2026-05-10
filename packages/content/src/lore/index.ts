import type { CertLore } from '@certquest/types/src/lore-schemas';
import { aPlusCore1Lore } from './a-plus-core1';
import { aPlusCore2Lore } from './a-plus-core2';
import { networkPlusLore } from './network-plus';
import { awsCcpLore } from './aws-ccp';
import { awsSaaLore } from './aws-saa';
import { ccnaLore } from './ccna';

export const certLore: Record<string, CertLore> = {
  'a-plus-core1': aPlusCore1Lore,
  'a-plus-core2': aPlusCore2Lore,
  'network-plus': networkPlusLore,
  'aws-ccp': awsCcpLore,
  'aws-saa': awsSaaLore,
  'ccna': ccnaLore,
};

export function getCertLore(certId: string): CertLore | undefined {
  return certLore[certId];
}

export function getRegionForDomain(certId: string, domainId: string) {
  return certLore[certId]?.regions.find((r) => r.domainId === domainId);
}

export function pickDailyMessage(
  certId: string,
  vars: { nextLesson?: string; dueReviews?: number; weakDomain?: string; readiness?: number; nextTrial?: string },
): string {
  const lore = certLore[certId];
  if (!lore) return '';
  const template = lore.dailyMessageTemplates[Math.floor(Math.random() * lore.dailyMessageTemplates.length)]!;
  return template
    .replace('{nextLesson}', vars.nextLesson ?? 'today\'s lesson')
    .replace('{dueReviews}', String(vars.dueReviews ?? 0))
    .replace('{weakDomain}', vars.weakDomain ?? 'your weakest area')
    .replace('{readiness}', String(vars.readiness ?? 0))
    .replace('{nextTrial}', vars.nextTrial ?? 'next trial');
}

export { aPlusCore1Lore, aPlusCore2Lore, networkPlusLore, awsCcpLore, awsSaaLore, ccnaLore };
