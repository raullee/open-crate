# Architecture

open-crate is deliberately small and deliberately layered, so the interesting part (the engine) can live anywhere and the boring part (a deployable site) is something you get for free.

## The one big idea: a static site with a build-time database

There is **no server and no runtime database**. The reference app imports `apps/web/data/crate.json` at build time; Next.js prerenders every page to static HTML/JS. Consequences:

- **Instant** pages, **free** hosting (any static host / Vercel), **nothing to breach**.
- Publishing new records = commit the JSON and re-deploy.
- Your data is a plain file in your repo. You can read it, diff it, grep it, export it, leave.

This is the single most important decision and the thing most worth copying.

## Three layers

```
┌─────────────────────────────────────────────────────────────┐
│  apps/web  (Next.js, static)                                  │
│  crate list · set builder (/studio) · leaderboard · 3D hero  │
│  thin lib/ wrappers ──────────────┐                          │
└───────────────────────────────────┼──────────────────────────┘
                                     │ imports
┌────────────────────────────────────▼─────────────────────────┐
│  @open-crate/core  (zero-dep, framework-agnostic, MIT)        │
│  schema · camelot · harmonic scoring · generator (swappable)  │
│  · adapters (import/enrich interfaces) · crate ops            │
└───────────────────────────────────▲──────────────────────────┘
                                     │ used by
┌────────────────────────────────────┴─────────────────────────┐
│  tools/  import.mjs · enrich.mjs  → write data/crate.json     │
└──────────────────────────────────────────────────────────────┘
```

### 1. `@open-crate/core` — the engine

Pure TypeScript, no runtime dependencies, runs anywhere JS runs (browser, Node, a bot, an Electron app). Modules:

- **schema** — the [Open Crate Format](./SCHEMA.md): `Track`, `Keyer`, `Crate`, `trackId`. Every field but artist/title is optional, so half-known vinyl is still valid.
- **camelot** — notation + conversions (musical ↔ Camelot ↔ Open Key), neighbours, compatibility. Clean MIT; no good permissive Camelot lib existed.
- **harmonic** — `camelotTransition(a, b)` → `{ smoothness, tension, semitones, note }`. Built on one identity: *one Camelot step = a perfect fifth = 7 semitones*, so a key-number delta `d` → `(7·d) mod 12` semitones. That gives every move a real interval and lets the generator score safe vs spicy.
- **generator** — the swappable `SetGenerator` strategy, a registry, and the open default (`greedy-harmonic`: a greedy walk optimising harmony + BPM continuity + an energy arc).
- **adapters** — `ImportAdapter` and `EnrichmentProvider` interfaces, plus a reference CSV adapter.
- **util/crate-ops** — set-length maths, idempotent dedupe/merge, leaderboard + stats derivation.

### 2. `apps/web` — the reference app

A Next.js (App Router, static) app. It does **not** re-implement any logic — `src/lib/crate.ts` and `src/lib/harmonic.ts` are thin re-exports of the engine, keeping the components decoupled from it. Branding lives in `src/site.config.ts`. Routes:

- `/` — gamified landing (R3F vinyl hero, progress, leaderboard, latest-additions feed).
- `/crate` — searchable/sortable list with the Camelot harmonic filter.
- `/studio` — the set builder (optional light passphrase gate over public data; `NEXT_PUBLIC_STUDIO_PASS`).

### 3. `tools/` — getting data in

Node scripts that reuse the engine to write `crate.json`: `import.mjs` (Rekordbox XML / CSV) and `enrich.mjs` (records.txt → Discogs + optional GetSongBPM). They're intentionally ~150 lines each, as templates to fork. See [tools/README](../tools/README.md).

## Why open-core

The framework and a competent default generator are MIT and free. The maintainer's personally-tuned generator is **not** published — it's just another `SetGenerator` implementation living in a private package. This keeps the artful, taste-specific part proprietary without holding the ecosystem hostage: anyone can write, register and ship their own generator against the same stable interface. The interface is the contribution; the tuning is the art.

## Extending it

- **New generator:** implement `SetGenerator`, `registerGenerator(mine)`. See [examples](../examples).
- **New import source:** implement `ImportAdapter` (Serato, Traktor, Engine…).
- **New enrichment:** implement `EnrichmentProvider` (a local key detector, MusicBrainz…).
- **Schema additions:** keep them optional and bump `OCF_VERSION` on breaking changes.
