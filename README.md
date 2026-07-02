# certquest-os

Certification study app with a shared content system. Six cert packs across five exam paths — CompTIA A+ (Core 1 + Core 2), Network+, AWS CCP, AWS SAA, and Cisco CCNA — in a monorepo with mobile (React Native / Expo), web dashboard, and a shared Supabase backend.

## Stack

- **Mobile:** React Native, Expo
- **Web:** React
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Shared content:** TypeScript monorepo (`packages/content`)
- **State:** Zustand

## Cert Packs

| Pack | Exam Code | Status |
|------|-----------|--------|
| CompTIA A+ Core 1 | 220-1201 | Full content |
| CompTIA A+ Core 2 | 220-1202 | Full content |
| CompTIA Network+ | N10-009 | Starter content |
| AWS Cloud Practitioner | CLF-C02 | Starter content |
| AWS Solutions Architect | SAA-C03 | Starter content |
| Cisco CCNA | 200-301 | Starter content |

A+ Core 1 and Core 2 have the deepest content: 20+ flashcards, 15+ question bank items (including ordering/PBQ-style), side quests, boss battles, and full practice exam blueprints per core.

## Monorepo Structure

```
packages/
  content/         Shared cert content, question banks, registries
    src/certs/     One folder per cert pack
  ui/              Shared component library
apps/
  mobile/          Expo app
  web/             React web dashboard
```

## Running Locally

```bash
# Install dependencies (from root)
npm install

# Start mobile
cd apps/mobile && npx expo start

# Start web
cd apps/web && npm run dev
```

Requires Supabase project credentials in environment variables — see `.env.example`.

## Notes

The content architecture is the main engineering decision here: all cert content lives in a single typed registry (`packages/content/src/index.ts`) that both the mobile and web surfaces consume. Adding a new cert pack means adding a folder under `packages/content/src/certs/` — the registry and routing pick it up automatically.
