# CertQuest OS — Roadmap

## Where the project stands

Core architecture is complete. All six cert paths exist with lore, lessons, flashcards, questions, side quests, boss battles, and practice exam blueprints. Mobile app runs all five tabs plus lesson/quiz/review/mini-game/boss/exam runners. Web dashboard mirrors progress. Content validates clean (0 errors).

What's missing is content depth, sync wiring, and a few authoring conveniences.

## Phase 1 — Make it pleasant to use daily

- [ ] In-app authoring UI (`/content-dev`) for lessons, flashcards, questions
- [ ] Confidence calibration: per-question post-answer rating ("how sure were you?")
- [ ] Wrong answer review queue across all certs
- [ ] Daily streak calendar visualization
- [ ] Exam date countdowns drive intensity recommendations
- [ ] Notification scheduling (local-only, no backend)

## Phase 2 — Content depth

- [ ] Fill the 32 question-bank authoring gaps for full-length practice exams
- [ ] Second mini-game per cert (spec calls for two on each A+)
- [ ] Second boss battle per A+ cert
- [ ] Cross-cert concept linking (e.g., subnetting appears in Network+ and CCNA)
- [ ] Glossary entries linked to lessons that use them
- [ ] Pre-exam diagnostic mode: 30-question mixed quiz that calibrates initial readiness

## Phase 3 — Sync and integrations

- [ ] Wire Supabase auth + sync (schema and RLS already exist)
- [ ] Conflict resolution for multi-device study
- [ ] NotebookLM Drive handoff: write Markdown to Drive, deep-link to NotebookLM source picker
- [ ] Anki .apkg writer for flashcard export
- [ ] Claude / ChatGPT context preload via URL
- [ ] Webhook events (study session start/end, exam pass)

## Phase 4 — Native polish

- [ ] Voice flashcards (TTS front, listen mode)
- [ ] Boss battle replay with "what would you have done differently"
- [ ] Real PBQ simulators (drag-drop architecture diagrams, terminal sandboxes)
- [ ] Audio study briefs for commute mode
- [ ] Apple Watch / Android Wear flashcard companion

## Phase 5 — Pre-publish hardening

- [ ] Cross-check every cert pack against official objectives PDFs
- [ ] Replace `examVersion: 'verify-before-publish'` with verified versions
- [ ] Verify every `passingScore` and `scaledScoreMax` against official sources
- [ ] Final pass for copyrighted terms in lore
- [ ] Beta with real users for one full study cycle per cert
- [ ] Add safety language: "this is a study aid, not a guarantee"

## What is intentionally out of scope

- Selling content packs as standalone products
- Multiplayer / study groups (interesting but not core)
- Live tutor matching
- Job-board integration
- Resume/portfolio builder

## Decision log

- A+ is two separate cert IDs (`a-plus-core1`, `a-plus-core2`) but groups visually under "CompTIA A+". This is the only multi-exam cert.
- Readiness ceiling at 70% until first boss passed. Prevents false confidence.
- Scaled score is a linear estimate, transparently labeled. We don't claim CompTIA's scoring algorithm.
- All content is original. No exam dumps, no copyrighted franchises.
- Local-first by default. Sync is optional and never primary.
