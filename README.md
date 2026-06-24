<div align="center">

# 🎚️ open-crate

**A free, open, local-first record crate. Catalogue your collection, enrich it with Camelot key + BPM, and draft harmonically-progressive sets — then make it yours.**

The engine is a swappable, MIT-licensed package. The set generator is a strategy you can replace. Your library lives in plain JSON you own forever.

[![MIT License](https://img.shields.io/badge/license-MIT-black)](./LICENSE)
[![core: @open-crate/core](https://img.shields.io/badge/engine-%40open--crate%2Fcore-ff48b0)](./packages/core)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

[**Live demo**](https://open-crate.vercel.app) · [**The engine**](./packages/core) · [**Import your library**](./tools) · [**Architecture**](./docs/ARCHITECTURE.md) · [**Roadmap**](./docs/ROADMAP.md)

</div>

---

> **The point is not to replace taste. It's to remove the tedious part, so you can spend more time deciding what the set should actually mean.**

Cataloguing your records and prepping a set is slow, fiddly, and usually locked inside a tool you rent. open-crate does the boring half — the filing, the key-matching, the first-draft sequencing — and hands the interesting half back to you. It runs as a static site (no server, nothing to hack, free to host) over a JSON file you control.

## Why this exists

We checked. As of 2026, **no tool — open-source or paid — does all three of**: catalogue your own collection (vinyl *and* digital), enrich it with Camelot key + BPM, and draft a full harmonic set with an energy arc. The paid auto-sequencer leaves energy out on purpose; the energy-aware ones are all closed-source SaaS; and there is **no maintained, permissively-licensed harmonic-mixing engine on npm at all**. open-crate is that missing piece, built in the open.

And the loudest things DJs actually complain about aren't fancy — they're **subscription fatigue**, **libraries that turn to chaos**, and **migration that eats your cue points**. So open-crate's first principle is simple: **your library is yours.** Plain files, full export, no account, works offline.

## What you get

- **A searchable crate** — sort by artist / BPM / key / year; tap a key to surface everything that mixes with it (Camelot harmonic filter).
- **A set builder** (`/studio`) — pick a length and a feel (*smooth* or *adventurous*), and it drafts a harmonically-sequenced set with an energy arc. Lock tracks, swap tracks, regenerate. It drafts; you decide.
- **A diggers leaderboard** — credit whoever helped catalogue, because filing records is more fun with friends.
- **A 3D vinyl hero** and a riso-punk design system, because it should look like something you'd want to show off.
- **An import path for everyone** — Rekordbox/CSV for digital DJs; a voice-note → transcribe → enrich flow for vinyl.

## How it compares

| | open-crate | Mixed In Key | DJ.Studio | Rekordbox | Discogs |
|---|:--:|:--:|:--:|:--:|:--:|
| Free & open-source | ✅ | ❌ | ❌ | ❌ | ❌ |
| Catalogue vinyl | ✅ | ❌ | ❌ | ❌ | ✅ |
| Catalogue digital | ✅ | ✅ | ✅ | ✅ | ❌ |
| Camelot key + BPM | ✅ | ✅ | ✅ | ✅ | ❌ |
| Auto-draft a full set | ✅ | ❌ | ✅ | ❌ | ❌ |
| Energy arc | ✅ | partial | ❌ | ❌ | ❌ |
| Swappable engine | ✅ | ❌ | ❌ | ❌ | ❌ |
| Own your data (plain files) | ✅ | partial | partial | ❌ | ❌ |

## Quickstart

```bash
git clone https://github.com/raullee/open-crate
cd open-crate
corepack pnpm install      # Node 20+, pnpm via corepack
corepack pnpm build:core   # build the engine package
corepack pnpm dev          # http://localhost:3000  (ships with sample records)
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/raullee/open-crate&root-directory=apps/web&build-command=cd%20../..%20%26%26%20corepack%20pnpm%20build)

Then **make it yours**: drop in your records (see [`/tools`](./tools)) and brand it in [`apps/web/src/site.config.ts`](./apps/web/src/site.config.ts).

## Bring your own collection

- **Digital DJs:** `node tools/import.mjs ~/rekordbox.xml --keyer "You"` (or a CSV). Key + BPM come across, so the set builder works immediately.
- **Vinyl:** record yourself reading records aloud → transcribe → `node tools/enrich.mjs records.txt`. The lookup fills in pressing, label, year, key and BPM. Talking, not typing.

Full guide: [`tools/README.md`](./tools/README.md).

## The engine is yours to extend

The whole thing is an **open core**: a framework + a good default, with the genuinely artful part left swappable.

```ts
import { registerGenerator, generateSet, type SetGenerator } from "@open-crate/core";

const mine: SetGenerator = {
  id: "my-sound",
  label: "My sound",
  generate(pool, opts) {
    // your sequencing logic -> ordered steps
    return { generator: "my-sound", steps: /* ... */ [] };
  },
};
registerGenerator(mine);
const set = generateSet(pool, { count: 12, mode: "adventurous" }, "my-sound");
```

The default generator ([`greedy-harmonic`](./packages/core/src/generator/greedy.ts)) ships open and is honest about what it does. **The maintainer's own, heavily-tuned generator stays private** — it's just a `SetGenerator` that lives outside this repo. That's the model on purpose: *the interface is the gift; the tuning is the art.* Fork the default, tune it to your sound, keep it yours or share it back. Same goes for [import adapters and key/BPM providers](./packages/core/src/adapters/types.ts).

## How it's built

```
open-crate/
├─ packages/core/   @open-crate/core — zero-dep engine: schema, Camelot,
│                   harmonic scoring, swappable generator, adapters (MIT, npm-ready)
├─ apps/web/        Next.js reference app (static-first). Reads data/crate.json.
├─ tools/           import.mjs + enrich.mjs — get your library in
└─ docs/            ARCHITECTURE, SCHEMA, ROADMAP
```

The site is **static**: `crate.json` is read at build time, so pages are instant, hosting is free, and there's no database to breach. Re-deploy to publish new records. More in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Contributing

This wants to become the go-to open toolkit for harmonic mixing — that only happens with you. Good first issues, the adapter interfaces, and new generators are the easiest places to start. See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [roadmap](./docs/ROADMAP.md).

## Credits & licence

MIT. Built from [crate.syncprimitive.com](https://crate.syncprimitive.com) by [@raullee](https://github.com/raullee) and contributors. Camelot/harmonic theory implemented clean; metadata via Discogs; optional BPM/key via GetSongBPM.
