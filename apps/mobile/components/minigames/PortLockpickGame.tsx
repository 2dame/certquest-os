import { MatchGame } from './MatchGame';
import type { MiniGamePayload } from '@certquest/minigames';

export function PortLockpickGame(props: { payload: MiniGamePayload; responses: Record<string, string>; onChange: (id: string, v: string) => void }) {
  return <MatchGame {...props} />;
}
