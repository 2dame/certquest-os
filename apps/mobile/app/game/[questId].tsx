import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from 'react-native';
import { findSideQuestById } from '@certquest/content';
import type { MiniGamePayload, MiniGameResult, MiniGameTemplate } from '@certquest/minigames';
import { MiniGameShell } from '../../components/minigames/MiniGameShell';
import { renderGameForTemplate } from '../../components/minigames/registry';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

export default function MiniGameRoute() {
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const found = findSideQuestById(questId ?? '');
  const recordMiniGameAttempt = useStore((s) => s.recordMiniGameAttempt);

  if (!found) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 20 }}>
        <Text style={{ color: theme.colors.text }}>Side quest "{questId}" not found.</Text>
      </View>
    );
  }

  const sideQuest = found.sideQuest;
  const certId = found.pack.meta.id;

  const rawPayload = sideQuest.payload as Record<string, unknown>;
  const rawItems = (rawPayload.items as unknown[]) ?? [];
  const payload: MiniGamePayload = {
    template: sideQuest.template as MiniGameTemplate,
    passThreshold: (rawPayload.passThreshold as number | undefined) ?? 80,
    timeLimitSeconds: rawPayload.timeLimitSeconds as number | undefined,
    items: rawItems.map((it) => {
      const item = it as Record<string, unknown>;
      return {
        id: item.id as string,
        prompt: (item.label ?? item.prompt) as string,
        answer: item.answer as string,
        distractors: item.distractors as string[] | undefined,
        explanation: item.explanation as string | undefined,
      };
    }),
  };

  const loreBrief: { setup: string; stakes: string; successMessage: string; failureMessage: string } =
    sideQuest.loreBrief
      ? {
          setup: sideQuest.loreBrief.setup ?? sideQuest.story ?? 'A new side quest awaits.',
          stakes: sideQuest.loreBrief.stakes ?? 'Complete the quest to earn XP.',
          successMessage: sideQuest.loreBrief.successMessage ?? 'Quest complete.',
          failureMessage: sideQuest.loreBrief.failureMessage ?? 'Try again.',
        }
      : {
          setup: sideQuest.story ?? 'A new side quest awaits.',
          stakes: 'Complete the quest to earn XP and improve your readiness.',
          successMessage: 'Quest complete. Your training advances.',
          failureMessage: 'Not yet. Review the missed items and try again.',
        };

  function handleComplete(result: MiniGameResult) {
    recordMiniGameAttempt({
      questId: questId!,
      certId,
      objectiveId: sideQuest.objectiveId,
      result,
      attemptedAt: new Date().toISOString(),
    });
  }

  return (
    <MiniGameShell
      questId={questId!}
      certId={certId}
      payload={payload}
      loreBrief={loreBrief}
      title={sideQuest.title}
      renderGame={({ payload: p, responses, onChange }) =>
        renderGameForTemplate(payload.template, { payload: p, responses, onChange })
      }
      onComplete={handleComplete}
      onClose={() => router.back()}
    />
  );
}
