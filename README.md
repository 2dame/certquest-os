# CertQuest OS

One unified certification training app. Six cert packs across five exam paths inside a single mobile app, web dashboard, and Supabase backend. CompTIA A+ covers two packs (Core 1 + Core 2); the other four paths are single-exam.

## Cert paths

CertQuest OS ships with full architectural support and starter content for six cert packs: CompTIA A+ Core 1 (220-1201), A+ Core 2 (220-1202), CompTIA Network+ (N10-009), AWS Certified Cloud Practitioner (CLF-C02), AWS Certified Solutions Architect Associate (SAA-C03), and Cisco CCNA (200-301). All six exist as cert packs inside `packages/content/src/certs/`, are wired into the unified registry at `packages/content/src/index.ts`, and render automatically across the mobile and web surfaces.

The A+ packs are deeper than the others by design: each Core has at least twenty flashcards, fifteen question-bank items including PBQ-style ordering questions, a side quest, a boss battle, and both a mini and full practice exam blueprint. The other certs ship at the spec minimum with the same structure, so you can grow them by adding more entries to the same files without touching app code.

## Practice exam simulator

The simulator is built on two pure packages, `@certquest/readiness` and `@certquest/practice-exam`, that the mobile app and the web app both consume. The readiness engine combines six signal categories (objective mastery, quiz performance, flashcard retention, boss battle performance, recency consistency, self-explanation confidence) with configurable weights and a 70% ceiling that lifts only after the first boss battle is passed. The practice exam engine handles attempt assembly with deterministic seeding, scoring with raw and scaled-score estimates, full domain and objective breakdowns, weak-area drilling, missed-question retry, and automatic flashcard generation from misses. The score report includes a remediation plan that classifies weak domains as mild, moderate, or severe.

## Readiness gates

Practice exams unlock at 80% overall readiness with no domain below 65%, all required boss battles defeated, and a minimum number of quiz attempts. The final exam simulation requires 90% overall readiness with no domain below 75% and at least one prior practice exam pass. Each blueprint also exposes an `allowManualOverride` flag so a user can take an exam early with a warning that the score will not be reliable.

## Content authoring and validation

The `q()` and `fc()` factories in `packages/content/src/authoring.ts` let you write a question or flashcard in two or three lines without repeating boilerplate. Run `pnpm validate` before any seed or commit; the validator at `scripts/validate-content.ts` checks every cert pack for missing sections, broken cross-references between domains and objectives, duplicate question IDs, exam blueprints that exceed available bank questions, and spec-minimum content counts. It exits with a non-zero status on any error so you can wire it into CI.

The `examVersion` field on every cert pack is intentionally set to the placeholder `verify-before-publish`. Cross-check each pack against the official objectives document for that certification before treating it as exam-ready.

## Database

Two migrations ship in `supabase/migrations/`. The first (`0001_init.sql`, from the earlier scaffold) covers certs, domains, objectives, lessons, lesson blocks, flashcards, side quests, boss battles, glossary, and acronyms. The second (`0002_practice_exams.sql`) adds the question bank, practice exam blueprints, attempts, per-question attempt records, readiness snapshots, remediation plans, and user exam goals. All user-progress tables have row-level security restricting reads and writes to the row's owner; static content is readable by any authenticated user.

The seed at `supabase/seed/seed.ts` iterates `certDisplayOrder` from the unified registry and calls `seedCert(certId)` for each pack. Adding a new cert is one new file under `packages/content/src/certs/` and one new entry in the unified registry; the seed picks it up automatically.

## Mobile navigation

Bottom tabs are Today, Certs, Practice, Progress, and Profile. Today shows the active cert, today's plan, due reviews, and a quick cert switcher. Certs renders all five paths grouped by certification with readiness percentages, lesson counts, and exam unlock status. Practice exposes the quick quiz, due reviews, weak-area drill, mini exams, and full exams, with locked exams showing exactly what's needed to unlock. The exam runner at `app/practice/[certId]/exam/[blueprintId].tsx` calls `assembleAttempt` and `scoreAttempt` directly from the practice-exam package.

## Web dashboard

Next.js routes mirror the mobile experience for laptop study at `/dashboard`, `/certs`, `/certs/[certId]`, `/practice`, `/practice/[certId]`, `/practice/[certId]/exam`, `/review`, `/progress`, `/proof`, `/notes`, `/settings`, and `/content-dev`.

## Getting started

```bash
pnpm install
pnpm validate                  # check all cert packs
supabase db push               # apply migrations
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm db:seed
pnpm mobile                    # start Expo
pnpm web                       # start Next.js
```

## Licensing and originality

All practice questions, lesson content, side quests, and boss battles are original. No copyrighted exam questions, no exam dumps, no real exam content. Theme names ("Help Desk Guild", "Packet Seas", "Cloud Village", "Architect Trials", "Router Kingdom") are original to CertQuest OS.
