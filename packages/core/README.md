# @open-crate/core

The framework-agnostic engine behind [open-crate](https://github.com/raullee/open-crate). Zero runtime dependencies. MIT.

It does four things:

1. **A portable crate schema** (the Open Crate Format) so your library isn't trapped in one app.
2. **Camelot + harmonic theory** — notation, conversions, and transition scoring built on the one fact that *one step round the Camelot wheel is a perfect fifth (7 semitones)*.
3. **A swappable set-generator** — an interface + an open default. Bring your own algorithm.
4. **Pluggable adapters** for importing libraries and enriching key/BPM/metadata.

```bash
npm install @open-crate/core
```

```ts
import { generateSet, planTrackCount, type Track } from "@open-crate/core";

const crate: Track[] = [
  { artist: "Gouryella", title: "Walhalla", key_camelot: "11A", bpm: 137, energy: 4 },
  { artist: "Energy 52", title: "Café Del Mar", key_camelot: "4A", bpm: 137, energy: 5 },
  // ...your collection
];

const { tracks } = planTrackCount(60, 45, 5); // 60-min set, 45s blends, ~5 min/track
const set = generateSet(crate, { count: tracks, mode: "adventurous" });

for (const step of set.steps) {
  console.log(step.track.artist, "-", step.track.title, step.transition?.label ?? "(open)");
}
```

## Bring your own generator

The set-generation algorithm is a strategy you can replace. Implement `SetGenerator`, register it, select it by id:

```ts
import { registerGenerator, generateSet, type SetGenerator } from "@open-crate/core";

const mine: SetGenerator = {
  id: "my-sound",
  label: "My sound",
  generate(pool, opts) {
    // your logic: return ordered steps
    return { generator: "my-sound", steps: /* ... */ [] };
  },
};

registerGenerator(mine);
const set = generateSet(pool, { count: 12, mode: "smooth" }, "my-sound");
```

> The maintainer keeps a personal, heavily-tuned generator private — it's just a `SetGenerator` that lives outside this repo. **The interface is the gift; the tuning is the art.** You're encouraged to do the same: fork the default, tune it to your sound, keep it yours or share it back.

## API

- **Schema:** `Track`, `Keyer`, `Crate`, `trackId`, `isTrack`, `OCF_VERSION`
- **Camelot:** `parseCamelot`, `harmonicNeighbours`, `areCompatible`, `musicalToCamelot`, `camelotToMusical`, `camelotToOpenKey`, `camelotRank`
- **Harmonic:** `camelotTransition` -> `{ smoothness, tension, semitones, note }`
- **Generator:** `generateSet`, `registerGenerator`, `listGenerators`, `greedyHarmonicGenerator`, `defaultEnergyArc`, types `SetGenerator` / `GenerateOptions` / `GeneratedSet`
- **Adapters:** `csvAdapter`, `parseCsv`, interfaces `ImportAdapter` / `EnrichmentProvider`
- **Crate ops:** `planTrackCount`, `setRuntimeMin`, `mergeTracks`, `leaderboard`, `crateStats`, `recentlyAdded`

MIT © open-crate contributors
