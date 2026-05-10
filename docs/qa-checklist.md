# CertQuest OS — QA Checklist

Run before declaring a build "done."

## Automated checks

```bash
pnpm install
pnpm validate    # content validator (errors block, warnings flag gaps)
pnpm typecheck   # TypeScript across all packages and apps
```

## Mobile smoke test (Expo)

```bash
pnpm mobile
```

- [ ] App launches without redbox
- [ ] Today screen renders for default cert (`a-plus-core1`)
- [ ] Mentor message displays
- [ ] Current region card shows
- [ ] Stats row (Trial Readiness, Rank, Streak) renders
- [ ] Start Training button routes to next incomplete lesson
- [ ] Cert switcher chips switch active cert and Today re-renders
- [ ] Tabs: Today, Certs, Practice, Progress, Profile all reachable
- [ ] Certs tab shows all 5 cert groups with regions visible
- [ ] Cert overview shows mentor, rival, world map, trials
- [ ] Lesson runner: intro → reading → check → done flow works
- [ ] Quiz runner: 10 questions, score screen with review
- [ ] Flashcard review: front → reveal → Again/Hard/Good/Easy ratings
- [ ] Mini-game runner: briefing → playing → scored phases
- [ ] Boss battle runner: briefing → scenario → rubric → result
- [ ] Practice exam runner submits and persists
- [ ] After events: XP, streak, badges all update
- [ ] After events: readiness recomputes
- [ ] AsyncStorage persists across app restarts

## Web smoke test (Next.js)

```bash
pnpm web
```

- [ ] All sidebar routes render: Today, Cert Paths, Practice, Progress, Proof, Settings, Content Dev
- [ ] `/certs/[certId]` shows lore world, mentor, rival, world map
- [ ] `/certs/[certId]/domains/[domainId]` shows domain + objectives
- [ ] `/practice/[certId]` lists exam blueprints with unlock requirements
- [ ] `/practice/[certId]/exam/[blueprintId]` shows blueprint details
- [ ] `/review/[certId]` shows flashcard deck
- [ ] `/content-dev` shows authoring stats
- [ ] No 404s on any spec'd route

## Content integrity

- [ ] No file imports `aPlusPack` (legacy alias)
- [ ] All cert IDs are canonical: `a-plus-core1`, `a-plus-core2`, `network-plus`, `aws-ccp`, `aws-saa`, `ccna`
- [ ] Every cert pack has `meta.lore` attached
- [ ] Every lesson has a `loreIntro`
- [ ] Every side quest has a `loreBrief` and a valid mini-game template
- [ ] Every boss battle has a `loreBrief` and rubric
- [ ] Every practice exam has a `loreTrial` and unlock requirements
- [ ] No mini-game payload uses an unsupported template

## Common breakage points

| Symptom | Likely cause |
|---|---|
| Today screen blank | Active cert ID doesn't exist in registry |
| Lesson not found | Stale lesson ID in store from old content |
| Quiz scores 0 | `correctAnswers` field missing on a question |
| Mini-game won't grade | Payload items missing `answer` field |
| Practice exam locked forever | `requiredBossBattlesPassed` references non-existent boss IDs |
| Readiness stuck at 0 | `recomputeReadinessForCert` not being called after events |
| Streak doesn't advance | `bumpStreak` not being called after events |

## Pre-publish gates

- [ ] All cert pack `examVersion` fields no longer say `verify-before-publish`
- [ ] All exam blueprints have enough authored questions in their bank
- [ ] All `passingScore` and `scaledScoreMax` values verified against official sources
- [ ] No real exam dump questions
- [ ] No copyrighted franchise terms in lore
