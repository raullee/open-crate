/**
 * The open default generator: a greedy harmonic walk with a BPM/energy-aware
 * objective. Good enough to be genuinely useful, simple enough to learn from and
 * fork. This is the v1 reference; tune your own and swap it in.
 *
 * It is NOT the maintainer's personal generator — that one stays private. This
 * one is honest, readable, and yours to improve.
 */

import { trackId, type Track } from "../schema/types.js";
import { parseCamelot } from "../camelot/camelot.js";
import { camelotTransition } from "../harmonic/harmonic.js";
import { defaultEnergyArc, type GenerateOptions, type GeneratedSet, type SetGenerator } from "./types.js";

function playable(tracks: Track[]): Track[] {
  // A track can enter a harmonic walk only if it has a key AND a bpm.
  return tracks.filter((t) => parseCamelot(t.key_camelot) && t.bpm);
}

function score(prev: Track, cand: Track, targetEnergy: number, mode: "smooth" | "adventurous"): number {
  const tr = camelotTransition(prev.key_camelot, cand.key_camelot);
  // Smooth optimises pure smoothness; adventurous blends in tension.
  const harmonic = mode === "adventurous" ? tr.smoothness * 0.55 + tr.tension * 0.45 : tr.smoothness;
  const bpmGap = Math.abs((prev.bpm ?? 0) - (cand.bpm ?? 0));
  const bpmPenalty = Math.min(40, bpmGap * 4); // ~10 BPM jump = full penalty band
  const energyGap = Math.abs((cand.energy ?? 3) - targetEnergy);
  const energyPenalty = energyGap * 10;
  return harmonic - bpmPenalty - energyPenalty;
}

export const greedyHarmonicGenerator: SetGenerator = {
  id: "greedy-harmonic",
  label: "Greedy harmonic (default)",
  description: "Open reference generator: greedy walk optimising harmony, BPM continuity and an energy arc.",

  generate(tracks: Track[], opts: GenerateOptions): GeneratedSet {
    const pool = playable(tracks);
    const excluded = new Set((opts.excluded ?? []).map(trackId));
    const used = new Set<string>();
    const arc = opts.energyArc ?? defaultEnergyArc;
    const out: Track[] = [];

    const take = (t: Track) => {
      out.push(t);
      used.add(trackId(t));
    };

    // 1. Locked tracks first, in given order.
    for (const l of opts.locked ?? []) {
      if (!used.has(trackId(l)) && !excluded.has(trackId(l))) take(l);
    }

    // 2. Seed if nothing locked: prefer seedKey, else lowest-energy opener.
    if (out.length === 0) {
      const candidates = pool.filter((t) => !used.has(trackId(t)) && !excluded.has(trackId(t)));
      const seed = opts.seedKey
        ? candidates.find((t) => t.key_camelot === opts.seedKey) ?? candidates[0]
        : [...candidates].sort((a, b) => (a.energy ?? 3) - (b.energy ?? 3))[0];
      if (seed) take(seed);
    }

    // 3. Greedy walk to the requested length.
    const n = Math.max(opts.count, out.length);
    while (out.length < n) {
      const prev = out[out.length - 1];
      const t = out.length / Math.max(1, n - 1);
      const target = arc(t);
      let best: Track | null = null;
      let bestScore = -Infinity;
      for (const c of pool) {
        const id = trackId(c);
        if (used.has(id) || excluded.has(id)) continue;
        const s = score(prev, c, target, opts.mode);
        if (s > bestScore) {
          bestScore = s;
          best = c;
        }
      }
      if (!best) break;
      take(best);
    }

    return {
      generator: this.id,
      steps: out.map((track, i) => ({
        track,
        transition: i === 0 ? null : camelotTransition(out[i - 1].key_camelot, track.key_camelot),
      })),
    };
  },
};
