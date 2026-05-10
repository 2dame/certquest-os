/**
 * Proof-based labs registry.
 * Each cert pack ships two labs that produce checkable artifacts.
 */

import { aPlusCore1ProofLabs } from './a-plus-core1';
import { aPlusCore2ProofLabs } from './a-plus-core2';
import { networkPlusProofLabs } from './network-plus';
import { awsCcpProofLabs } from './aws-ccp';
import { awsSaaProofLabs } from './aws-saa';
import { ccnaProofLabs } from './ccna';
import type { ProofLab } from '@certquest/types';

export const proofLabsByCert: Record<string, ProofLab[]> = {
  'a-plus-core1': aPlusCore1ProofLabs,
  'a-plus-core2': aPlusCore2ProofLabs,
  'network-plus': networkPlusProofLabs,
  'aws-ccp': awsCcpProofLabs,
  'aws-saa': awsSaaProofLabs,
  'ccna': ccnaProofLabs,
};

export const allProofLabs: ProofLab[] = [
  ...aPlusCore1ProofLabs,
  ...aPlusCore2ProofLabs,
  ...networkPlusProofLabs,
  ...awsCcpProofLabs,
  ...awsSaaProofLabs,
  ...ccnaProofLabs,
];

export function getProofLabsForCert(certId: string): ProofLab[] {
  return proofLabsByCert[certId] ?? [];
}

export {
  aPlusCore1ProofLabs,
  aPlusCore2ProofLabs,
  networkPlusProofLabs,
  awsCcpProofLabs,
  awsSaaProofLabs,
  ccnaProofLabs,
};
