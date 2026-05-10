# CertQuest OS — Content Authoring Guide

## Where content lives

```
packages/content/src/
├── certs/
│   ├── a-plus-core1/index.ts
│   ├── a-plus-core2/index.ts
│   ├── network-plus/index.ts
│   ├── aws-ccp/index.ts
│   ├── aws-saa/index.ts
│   └── ccna/index.ts
├── lore/
│   ├── a-plus-core1.ts
│   ├── a-plus-core2.ts
│   ├── ...
│   └── index.ts
├── authoring.ts   # q() and fc() factories
├── validate.ts    # validator
└── index.ts       # registry
```

## Cert pack structure

Each cert pack exports a fixed set of named arrays. Order matters — the registry expects this shape:

```ts
export const CERT_ID = 'a-plus-core1' as const;
export const meta = { id, examName, examCode, examVersion, passingScore, scaledScoreMax, vendor, displayOrder, lore };
export const examCodes = [...];
export const domains = [...];
export const objectives = [...];
export const lessons = [...];
export const flashcards = [...];
export const questionBank = [...];
export const sideQuests = [...];
export const bossBattles = [...];
export const practiceExams = [...];
export const glossary = [...];
export const acronyms = [...];
export const examTraps = [...];
```

## Authoring helpers

`packages/content/src/authoring.ts` exports `q()` and `fc()` factories. Use them — they auto-detect question type, set sensible defaults, and reduce boilerplate.

```ts
q({
  id: 'aplus-c1-q-001',
  domainId: 'aplus-c1-hardware',
  objectiveId: 'aplus-c1-obj-ram',
  difficulty: 'beginner',
  question: 'Which RAM type uses 288 pins?',
  choices: { a: 'DDR3', b: 'DDR4', c: 'DDR5', d: 'SO-DIMM' },
  answer: 'b',
  explanation: 'DDR4 DIMMs use 288 pins. DDR5 also uses 288 pins but has a different keying.',
  examTrap: 'DDR3 has 240 pins. Memorize the pin counts.',
});
```

For multi-select, pass an array of letters as `answer`. The factory sets `type: 'multiple_select'` automatically.

## Lesson schema

Each lesson needs:

- `id`, `certId`, `objectiveId`, `title`, `estimatedMinutes`
- `loreIntro` with `scene`, `mentorMessage`, `missionObjective`
- `blocks[]` — array of `{ kind, body }` where `kind` is one of: `intro`, `concept`, `analogy`, `technical`, `exam_angle`, `common_mistake`, `memory_hook`, `command`, `scenario`, `troubleshoot_flow`, `why_it_matters`

The lesson runner renders each block with the kind label as a section header.

## Question types

Supported: `multiple_choice`, `multiple_select`, `scenario`, `troubleshooting`, `ordering`, `matching`, `command_selection`, `architecture_decision`, `cli_output_interpretation`, `pbq_sim`, `subnetting`.

The mobile quiz runner handles `multiple_choice` and `multiple_select` natively. Other types render as choice lists.

For ordering questions, set `correctAnswers` to the choice IDs in the correct order. The runner compares the submitted ordering directly.

## Mini-game payloads

Side quest payloads must match the template:

| Template | Payload shape |
|---|---|
| `cable_crafter`, `port_lockpick`, `service_sorter`, `packet_detective`, `troubleshooting_sequence`, `acronym_blitz`, `cloud_architect` | `{ items: [{ id, prompt, answer, distractors[] }] }` |
| `osi_tower` | Same shape; answer is one of the seven layer labels (`L1 Physical`, ..., `L7 Application`) |
| `subnet_sprint` | Same shape; answer is a free-text string compared after lowercase + whitespace normalize |
| `cli_dojo` | Same shape; choices include the answer + distractors as plausible IOS commands |

Validator catches invalid templates and missing items.

## Flashcards

Use the `fc()` factory:

```ts
fc({ id: 'aplus-c1-fc-001', domainId: '...', objectiveId: '...', kind: 'basic', front: '...', back: '...' });
```

Supported kinds: `basic`, `cloze`, `acronym`, `port_protocol`, `scenario`, `command`, `reverse`. Default is `basic`.

## Boss battles

Each boss has a `rubric` with `passThreshold` (percent) and `dimensions[]`. Each dimension has `key`, `weight`, `description`. Weights should sum to 1.0.

The mobile runner renders a self-assessment rubric where the user rates themselves 0-100% on each dimension. Score = sum(rating × weight).

## Practice exam blueprints

```ts
{
  id: 'aplus-c1-mini-exam',
  certId: CERT_ID,
  title: 'Help Desk Trial — Mini Exam',
  questionCount: 10,
  timeLimitSeconds: 900,
  passingScore: 675,
  scaledScoreMax: 900,
  domainTargets: [
    { domainId: 'aplus-c1-hardware', questionCount: 3 },
    ...
  ],
  unlockRequirements: {
    minReadiness: 80,
    minDomainReadiness: 65,
    requiredBossBattlesPassed: ['aplus-c1-boss-storm'],
  },
  loreTrial: { trialName, unlockMessage, lockedMessage, passMessage, failMessage },
}
```

`domainTargets[].questionCount` must sum to ≤ `questionCount`. The validator warns if the question bank has fewer eligible questions than the blueprint targets.

## Validation

```bash
pnpm validate
```

The validator checks:

- All cert IDs are canonical
- No stale `aPlusPack` references
- Cross-references resolve (objectives → domains, lessons → objectives, etc.)
- Domain weights sum to ~1.0
- Mini-game templates are valid
- Lore regions map to real domains
- Practice exam blueprints have enough authored questions

Errors block; warnings flag gaps to fix later.

## Original content rule

- No exam dump questions
- No copyrighted franchise terms in lore
- All questions written from scratch, with original explanations

## Content depth minimums (per spec)

| Cert | Lessons | Flashcards | Questions | Side quests | Boss battles |
|---|---|---|---|---|---|
| A+ Core 1 / Core 2 | ≥4 | ≥25 | ≥20 | ≥2 | ≥2 |
| All others | ≥3 | ≥20 | ≥15 | ≥1 | ≥1 |

Below these counts the validator emits warnings. Errors are reserved for structural issues.

## Rich (9-field) flashcards

`packages/content/src/rich-flashcards/<cert>.ts` exports an array per cert,
wired into `rich-flashcards/index.ts`. Use `rfc()` from `authoring-rich.ts`:

```ts
rfc({
  id: 'aplus-c1-rfc-001',
  certId: 'a-plus-core1',
  domainId: 'aplus-c1-network',
  objectiveId: 'aplus-c1-obj-network-protocols',
  term: 'APIPA',
  definition: '...',
  whyItMatters: '...',
  memoryHook: '...',
  commonTrap: '...',
  example: '...',
  examAngle: '...',
  // notebookLmReadyText / audioBriefText auto-composed if omitted
  tags: ['ip', 'dhcp'],
  difficulty: 'beginner',
});
```

The nine fields together support cognitive layers: term/definition for
recognition, whyItMatters for motivation, memoryHook for encoding (dual-
coding theory), commonTrap for discrimination training, example for
worked-problem rehearsal, examAngle for exam-room cue translation, and
notebookLmReadyText / audioBriefText for multi-modal review.

## Proof-based labs

`packages/content/src/proof-labs/<cert>.ts`. Use `proofLab()` and `task()`:

```ts
proofLab({
  id: 'aplus-c1-lab-001',
  certId: 'a-plus-core1',
  domainId: 'aplus-c1-troubleshoot',
  objectiveId: 'aplus-c1-obj-troubleshoot-method',
  title: 'The Boot Diagnostic Trial',
  difficulty: 'beginner',
  estimatedMinutes: 30,
  xpReward: 80,
  loreNarration: 'Captain Byte slides a sealed dossier...',
  tools: [{ name: 'VirtualBox', url: 'https://www.virtualbox.org/' }],
  setup: '...',
  learningObjectives: ['...', '...', '...'],
  tasks: [
    task('t1', 'prompt', 'output_match', 'expected', 'hint'),
    // ...
  ],
  commonMistakes: ['...'],
  troubleshooting: [{ symptom: '...', fix: '...' }],
  sourceRefs: ['https://www.comptia.org/...'],
});
```

`verificationKind` options:

| Kind | Use when |
|---|---|
| `output_match` | Exact CLI / config output is the proof |
| `screenshot` | UI state screenshot is the proof |
| `calculation` | Numeric value (compared after normalization) |
| `decision` | Pick correct option AND explain reasoning |
| `free_response` | Open-ended write-up (logs, designs, post-mortems) |

Labs must be passable only by completing the work. "Click here to mark
complete" is forbidden; every task produces a verifiable artifact.
