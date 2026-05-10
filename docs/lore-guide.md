# CertQuest OS — Lore Guide

## Why lore is part of the content model

Lore is not skinning. It is structural. Every cert path is its own world. Every domain is a region with a threat. Every lesson is a mission. Every boss battle is a trial.

The technical content stays clear and accurate. The lore wraps it so studying feels like a training arc instead of a textbook chapter. Users who ignore the lore can still learn. Users who engage with the lore will find it harder to put the app down.

## The six worlds

| Cert | World | User role | Mentor | Rival |
|---|---|---|---|---|
| A+ Core 1 | The Help Desk Guild | Rookie Hardware Recruit | Captain Byte | The Ticket Queue |
| A+ Core 2 | The Field Support Order | Field Support Operative | Agent Patch | The Chaos Log |
| Network+ | The Packet Seas | Network Cartographer | Admiral Ping | The Latency Kraken |
| AWS CCP | Cloud Village | Cloud Initiate | Sage Nimbus | The Billing Fog |
| AWS SAA | The Architect Trials | Cloud Architect Candidate | Master Well-Arch | The Cost Dragon |
| CCNA | Router Kingdom | CLI Dojo Apprentice | Sensei Route | The Broadcast Storm |

Each world has its own tone. The Field Support Order is procedural and calm. The Architect Trials are formal and high-stakes. The Router Kingdom is dojo-disciplined. Tone is part of the world definition.

## Lore schema

Defined in `packages/types/src/lore-schemas.ts`.

A `CertLore` includes: `worldName`, `userRole`, `tagline`, `tone`, `mentor`, `rival`, `regions[]`, `rankTitles[]`, `dailyMessageTemplates[]`. Each `LoreRegion` has `domainId`, `regionName`, `description`, `threat`, `unlockMessage`, `completionMessage`.

Content items can layer lore:

- `Lesson.loreIntro`: scene + mentorMessage + missionObjective
- `SideQuest.loreBrief`: setup + stakes + success/failure messages
- `BossBattle.loreBrief`: bossName + arena + setup + stakes + victory/retry messages
- `PracticeExamBlueprint.loreTrial`: trialName + lock/unlock/pass/fail messages
- `BadgeDefinition.loreTitle` + `titleFlavor`

## Authoring tone

Keep it tactical and focused. Avoid childishness. Avoid epic-fantasy bombast. Think:

- "Three tickets are already in queue. Inside the Workbench first — that pattern keeps showing up."
- "The Cost Dragon stirs. Tag every resource before month-end."

Mentor messages should be short, second-person, and actionable. Region threats should name specific failure modes ("Off-by-one host counts. Wildcard masks confused with subnet masks."), not vague vibes.

## Where lore appears in the UI

- **Today screen**: world name, mentor message of the day, current region, threat, Start Training button
- **Cert overview**: mentor box, rival box, world map of regions with threats and progress
- **Lesson runner**: scene, mentor message, mission objective, then the technical lesson
- **Mini-game runner**: setup, stakes, success/failure messages
- **Boss battle runner**: arena name, scenario setup, victory/retry messages
- **Practice exam runner**: trial name, locked reason in-world AND plain English

## Original lore only

- No copyrighted franchise names, characters, or worlds
- No anime/sports/film franchise terms
- Mentors are original characters with original names

## Daily mentor message templates

Each cert defines `dailyMessageTemplates[]` with placeholder tokens: `{nextLesson}`, `{dueReviews}`, `{weakDomain}`, `{readiness}`, `{nextTrial}`. The Today screen calls `pickDailyMessage(certId, vars)` which selects a template and substitutes tokens.

Add 5-8 templates per cert. Variety keeps daily messages from feeling stale.

## Adding a new cert

To add a seventh cert path:

1. Create `packages/content/src/lore/<cert-id>.ts` with full `CertLore`
2. Create `packages/content/src/certs/<cert-id>/index.ts` with cert pack
3. Wire both into the registry (`packages/content/src/index.ts`)
4. Run `pnpm validate` — the validator will flag missing regions, broken domain references, and lore coverage gaps
5. Add a row to `certGroups` if the cert should display under a group label
