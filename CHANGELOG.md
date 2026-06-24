# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Planned
- In-browser, client-side key + BPM analysis (no upload).
- First-class energy axis + multi-bucket tags.
- "Play next from what I own" co-pilot.
- Additional import adapters: Serato, Traktor (.nml), Engine DJ.
- Publish `@open-crate/core` to npm.
- "Acid Booth" default skin + a themeable skin system.

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full, pain-point-driven plan.

## [0.1.0] - 2026-06-24
### Added
- `@open-crate/core` — zero-dependency engine: the Open Crate Format schema,
  Camelot notation + conversions, harmonic transition scoring, a swappable
  `SetGenerator` (open `greedy-harmonic` default + registry), and
  `ImportAdapter` / `EnrichmentProvider` interfaces. 12 tests.
- `apps/web` — Next.js static reference app: searchable crate, set builder
  (`/studio`), diggers leaderboard, 3D vinyl hero.
- `tools/` — `import.mjs` (Rekordbox XML / CSV) and `enrich.mjs`
  (records.txt → Discogs + optional GetSongBPM).
- Docs: README, ARCHITECTURE, SCHEMA, ROADMAP, CONTRIBUTING, INSTALL.
- Frictionless install: Deploy button, `npx degit` one-liner, and an
  LLM bootstrap prompt.

[Unreleased]: https://github.com/raullee/open-crate/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/raullee/open-crate/releases/tag/v0.1.0
