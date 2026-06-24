# Contributing to open-crate

Thanks for being here. open-crate wants to become the go-to open toolkit for harmonic mixing, and that only happens with other people's hands on it.

## Setup

```bash
corepack pnpm install
corepack pnpm build:core   # build the engine
corepack pnpm dev          # run the app at http://localhost:3000
corepack pnpm test         # engine tests (vitest)
```

Node 20+. pnpm comes via `corepack` (bundled with Node) — no global install needed.

## Good first contributions

- **A new import adapter** — Serato, Traktor (`.nml`), Engine DJ, VirtualDJ, M3U8. Implement [`ImportAdapter`](./packages/core/src/adapters/types.ts); copy [`csv.ts`](./packages/core/src/adapters/csv.ts) as a template.
- **A new set generator** — implement [`SetGenerator`](./packages/core/src/generator/types.ts). See [`examples/`](./examples).
- **An enrichment provider** — wrap a key/BPM source behind [`EnrichmentProvider`](./packages/core/src/adapters/types.ts).
- **Pain-point features** from the [roadmap](./docs/ROADMAP.md) (energy axis, dedupe, "play next" co-pilot, PWA/offline).

## Principles (so PRs land smoothly)

1. **Local-first, no lock-in.** No mandatory accounts, no phone-home, no cloud requirement. Data stays in plain files the user owns.
2. **Draft, don't dictate.** Sequencing assists taste; it never claims to "build your set." Mind the language.
3. **The engine stays zero-dependency and framework-agnostic.** Anything Node/browser-specific belongs in `apps/web` or `tools`, not `packages/core`.
4. **Be honest about analysis.** Surface confidence; make manual override trivial. False precision is worse than a blank.
5. **Schema additions are optional + versioned.** Don't break existing crates.

## Workflow

1. Open an issue or discussion first for anything non-trivial.
2. Branch, make the change, add/adjust tests in `packages/core` where it applies.
3. `corepack pnpm test` and `corepack pnpm build` must pass.
4. Keep PRs focused; describe the *why*. Conventional-commit titles appreciated (`feat:`, `fix:`, `docs:`).

By contributing you agree your work is MIT-licensed. Be decent to each other.
