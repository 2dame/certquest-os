# CertQuest OS — Architecture

## High-level shape

CertQuest OS is one product with three surfaces and one shared business-logic core.

```
apps/mobile (Expo, primary)        apps/web (Next.js, mirror)
        \                          /
         \                        /
          packages/* (shared TypeScript)
                    |
              supabase/ (optional sync, optional RLS)
```

The mobile app is the primary surface and works fully offline. The web dashboard is a read-mostly mirror for laptop study. Supabase is optional — local-only mode works without login.

## Monorepo

- `apps/mobile` — Expo React Native app, the primary experience
- `apps/web` — Next.js dashboard
- `packages/types` — shared Zod schemas and TypeScript types
- `packages/content` — cert packs, lore registry, validation
- `packages/readiness` — readiness engine (pure)
- `packages/practice-exam` — exam blueprint assembly + scoring (pure)
- `packages/minigames` — mini-game grading (pure)
- `packages/gamification` — XP, ranks, badges, streaks (pure)
- `packages/scheduler` — daily plan generation (pure)
- `packages/integrations` — export adapters (NotebookLM, Anki, Drive, etc.)
- `packages/db` — Supabase types and helpers (optional)
- `supabase/migrations` — SQL schema with RLS
- `supabase/seed` — seeds Supabase from the content registry

## Local-first persistence

Mobile uses Zustand with AsyncStorage persistence. Every event (lesson complete, quiz attempt, flashcard review, mini-game, boss battle, practice exam) writes through the same store and triggers four side effects:

1. Update objective mastery
2. Award XP and check badge unlocks
3. Update streak (once per day)
4. Recompute readiness via `@certquest/readiness`

The store is the single source of truth. Supabase sync, when enabled, will mirror the store — never replace it.

## Content model

Each cert pack exports: `meta`, `examCodes`, `domains`, `objectives`, `lessons`, `flashcards`, `questionBank`, `sideQuests`, `bossBattles`, `practiceExams`, `glossary`, `acronyms`, `examTraps`. Lore is attached to `meta.lore` and to specific items (`lesson.loreIntro`, `sideQuest.loreBrief`, `bossBattle.loreBrief`, `practiceExam.loreTrial`).

The unified registry (`packages/content/src/index.ts`) exposes `getCertPack`, `findLessonById`, `findQuestionById`, etc. Screens never import a single cert pack directly.

## Readiness engine

Readiness is a 0-100 score combining six signals:

- 35% objective mastery
- 20% quiz/practice performance
- 15% flashcard retention
- 15% boss battle / mini-game performance
- 10% recency / consistency
- 5% self-explanation / confidence

Hard rule: readiness is capped at 70% until at least one boss battle is passed for that cert. This prevents "feels ready, isn't" failures.

## Practice exam unlocks

A practice exam unlocks when:

- Overall readiness ≥ blueprint's `minReadiness`
- Every domain readiness ≥ blueprint's `minDomainReadiness`
- Every boss battle in `requiredBossBattlesPassed` has been passed
- (Final simulations only) at least one regular practice exam has been passed

Manual override is allowed with a warning.

## Scheduler

`generateTodayPlan(inputs)` produces a `TodayPlan` with prioritized tasks. Inputs combine active cert state, flashcard due count, mastery map, readiness snapshot, and current region. Intensity (`chill` / `normal` / `aggressive`) caps task count and target minutes.

The scheduler enforces `mastery_required_boss_battles`: a boss battle only appears as ready when average mastery across its objectives meets the threshold (default 0.5).

## Mini-games

Ten templates: `cable_crafter`, `port_lockpick`, `osi_tower`, `subnet_sprint`, `packet_detective`, `cloud_architect`, `cli_dojo`, `service_sorter`, `troubleshooting_sequence`, `acronym_blitz`. The engine (`packages/minigames`) is pure logic; mobile renders templates via a registry.

## Gamification

Seven ranks (Recruit → Apprentice → Operator → Specialist → Tactician → Architect → Master) tracked per cert based on per-cert XP. Eight core badges (first lesson, first boss, first exam pass, 7-day streak, 30-day streak, three rank thresholds). XP awards are intentionally low for opening the app and high for boss/exam passes.

## Validation

`pnpm validate` runs `validateAllContent` from `packages/content/src/validate.ts`. It distinguishes errors (block deploy) from warnings (content gaps). Content depth gaps are warnings; reference integrity violations are errors.

## What's intentionally not done yet

- Supabase sync wiring (schema exists, mobile is local-only)
- In-app authoring UI (`/content-dev`)
- Anki .apkg export (stub adapter exists)
- Audio study brief export
- Confidence calibration UI per question
