# Roadmap

open-crate's direction is set by what DJs and electronic musicians actually complain about, not by what's fun to build. The priorities below come from a 2024–2026 sweep of r/DJs, r/Beatmatch, r/edmproduction, r/vinyl and the DJ forums. The recurring, load-bearing pains — in order — are **subscription fatigue**, **library entropy**, and **migration lock-in**; harmonic mixing itself is genre-niche and culturally divisive, and "AI builds my whole set" triggers a real backlash. open-crate leans into the first three and treats sequencing as a *draft you edit*, never autopilot.

Legend: shipped ✅ · next ⏳ · planned ◻️. Demographics: **BD** bedroom · **PRO** gigging · **VC** vinyl collector · **PROD** producer.

## P0 — the wedge

- ✅ **Free, open-source, local-first, no account.** Static site over a JSON file you own. (all)
- ✅ **Plain, exportable data (Open Crate Format).** Your library is never trapped. (PRO, PROD)
- ✅ **Swappable set generator + open default.** The engine others build on. (all)
- ✅ **Camelot key + BPM model with energy.** (harmonic DJs, PROD)
- ⏳ **Lossless import preserving cues/loops/grids/ratings**, never a silent overwrite. Today: Rekordbox XML + CSV (names/key/BPM). Next: hot cues, memory cues, beatgrids; Serato, Engine, Traktor. (PRO)
- ⏳ **Confidence-scored key/BPM with one-click override.** Honesty beats false precision; flag low-confidence (esp. major-key) results. (PROD, BD)

## P1 — what makes it loved

- ◻️ **In-browser analysis (no upload):** client-side BPM ([web-audio-beat-detector](https://github.com/chrisguttandin/web-audio-beat-detector), MIT) and key (essentia.js) so you can key local files privately, offline. (all)
- ◻️ **First-class energy axis + multi-bucket tags.** Stop hacking stars/colours/genre. One track lives in many crates. (all)
- ◻️ **"Play next from what I own" co-pilot** — rank candidates by key + BPM + energy, and let you save "mixes that worked" into a personal good-mix matrix (the explicitly-requested, unbuilt feature). (BD, PRO)
- ◻️ **Rediscover what you own** — never-played / least-played / by-energy views; the antidote to library overwhelm. (BD, PRO)
- ◻️ **Drawable energy curve** for the set builder (warm-up → peak → release), framed as a draft. (BD, PRO)
- ◻️ **Safe, backup-first duplicate detection + metadata cleanup** (feat./ft. normalisation, bulk edit). (all)
- ◻️ **PWA / offline mode** so the crate works at the gig and in the record-store basement. (PRO, VC)

## P1/P2 — the vinyl angle (open-crate's distinctive flank)

- ⏳ **Low-effort vinyl entry** — voice → transcribe → enrich (shipped via `tools/enrich.mjs`); next: barcode scan + sleeve photo from the phone. (VC)
- ◻️ **"Do I already own this?"** offline check to kill duplicate-buying — the most-felt vinyl pain. (VC)
- ◻️ **Key/BPM for vinyl-only DJs** — fill the gap left when Disconest died (Nov 2024). (vinyl DJ)

## Deliberately NOT doing (loud-but-niche / culturally radioactive)

- ❌ **"AI builds my whole set" autopilot.** The community treats this as cheating; we draft, you decide.
- ❌ **Camelot-as-hero.** Harmonic mixing is genre-bound; it's one input to the co-pilot, not the marquee.
- ❌ **Cloud lock-in / mandatory accounts / phone-home.** Local-first, always.
- ❌ **Selling the secret sauce.** The maintainer's tuned generator stays private; the framework + a solid default stay free.

## Ecosystem

- ◻️ Publish `@open-crate/core` to npm with semantic-release + changesets.
- ◻️ A plugin-template repo for custom generators and adapters.
- ◻️ Adapter contributions: Serato, Traktor NML, Engine DJ, VirtualDJ, M3U8.
- ◻️ A hosted docs site.

Have a pain we missed, or a generator/adapter to contribute? [Open an issue or discussion.](https://github.com/raullee/open-crate/issues)
