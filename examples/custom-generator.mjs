/**
 * Example: write and register your own set generator.
 *
 *   corepack pnpm build:core
 *   node examples/custom-generator.mjs
 *
 * This one is intentionally simple — a BPM-ascending "slow build" — to show the
 * shape. Your real generator can be as clever (and as private) as you like; it
 * just has to satisfy the SetGenerator interface.
 */
import {
  registerGenerator,
  generateSet,
  listGenerators,
  camelotTransition,
} from "@open-crate/core";

/** @type {import("@open-crate/core").SetGenerator} */
const slowBuild = {
  id: "slow-build",
  label: "Slow build (BPM ascending)",
  description: "Sorts playable tracks by ascending BPM. Naive, but yours.",
  generate(pool, opts) {
    const playable = pool.filter((t) => t.key_camelot && t.bpm);
    const ordered = [...playable].sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0)).slice(0, opts.count);
    return {
      generator: "slow-build",
      steps: ordered.map((track, i) => ({
        track,
        transition: i === 0 ? null : camelotTransition(ordered[i - 1].key_camelot, track.key_camelot),
      })),
    };
  },
};

registerGenerator(slowBuild);

const pool = [
  { artist: "A", title: "1", key_camelot: "8A", bpm: 122 },
  { artist: "B", title: "2", key_camelot: "9A", bpm: 126 },
  { artist: "C", title: "3", key_camelot: "8B", bpm: 130 },
  { artist: "D", title: "4", key_camelot: "10A", bpm: 124 },
];

console.log("Registered generators:", listGenerators().map((g) => g.id).join(", "));

const set = generateSet(pool, { count: 4, mode: "smooth" }, "slow-build");
for (const s of set.steps) {
  console.log(`${s.track.bpm} BPM ${s.track.key_camelot}  ${s.track.artist} - ${s.track.title}`, s.transition ? `(${s.transition.label})` : "");
}
