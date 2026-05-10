import type { MiniGamePayload, MiniGameTemplate } from '@certquest/minigames';
import { CableCrafterGame } from './CableCrafterGame';
import { PortLockpickGame } from './PortLockpickGame';
import { OsiTowerGame } from './OsiTowerGame';
import { SubnetSprintGame } from './SubnetSprintGame';
import { PacketDetectiveGame } from './PacketDetectiveGame';
import { CloudArchitectGame } from './CloudArchitectGame';
import { CliDojoGame } from './CliDojoGame';
import { ServiceSorterGame } from './ServiceSorterGame';
import { TroubleshootingSequenceGame } from './TroubleshootingSequenceGame';
import { AcronymBlitzGame } from './AcronymBlitzGame';

interface Props {
  payload: MiniGamePayload;
  responses: Record<string, string>;
  onChange: (id: string, v: string) => void;
}

const REGISTRY: Record<MiniGameTemplate, (p: Props) => React.ReactNode> = {
  cable_crafter: CableCrafterGame,
  port_lockpick: PortLockpickGame,
  osi_tower: OsiTowerGame,
  subnet_sprint: SubnetSprintGame,
  packet_detective: PacketDetectiveGame,
  cloud_architect: CloudArchitectGame,
  cli_dojo: CliDojoGame,
  service_sorter: ServiceSorterGame,
  troubleshooting_sequence: TroubleshootingSequenceGame,
  acronym_blitz: AcronymBlitzGame,
};

export function renderGameForTemplate(template: MiniGameTemplate, props: Props) {
  const Component = REGISTRY[template];
  if (!Component) return null;
  return <Component {...props} />;
}
