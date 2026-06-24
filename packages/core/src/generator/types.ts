/**
 * The swappable engine. THIS is the extensibility contract: implement
 * `SetGenerator`, register it, and open-crate will use it to sequence a crate
 * into a set. The default ships open (see ./greedy). Anyone can write their own.
 *
 * Open-core note: open-crate's maintainer keeps a personal, heavily-tuned
 * generator PRIVATE. That generator is simply a `SetGenerator` living outside
 * this repo. The interface is the gift; the tuning is the art. You are
 * encouraged to do the same — fork the default, tune it to your sound, keep it
 * yours, or share it back.
 */

import type { Track } from "../schema/types.js";
import type { Transition } from "../harmonic/harmonic.js";

export type Mode = "smooth" | "adventurous";

/** Options every generator must accept. Generators may read `ext` for extras. */
export interface GenerateOptions {
  /** How many tracks the set should contain. */
  count: number;
  /** Smooth (stay harmonically safe) vs adventurous (allow tension). */
  mode: Mode;
  /** Tracks that must appear, in this order, at the front. */
  locked?: Track[];
  /** Tracks to exclude entirely. */
  excluded?: Track[];
  /** Optional Camelot key to start from. */
  seedKey?: string | null;
  /**
   * Target energy curve as a function of position t in [0,1] -> energy [1,5].
   * Default is warm-up -> peak ~78% -> ease-out. Override to draw your own night.
   */
  energyArc?: (t: number) => number;
  /** Generator-specific knobs. Ignored by generators that don't understand them. */
  ext?: Record<string, unknown>;
}

export interface SetStep {
  track: Track;
  /** The transition from the previous step (null for the first). */
  transition: Transition | null;
}

export interface GeneratedSet {
  steps: SetStep[];
  /** Which generator produced this, for UI/debugging. */
  generator: string;
}

/**
 * A set-generation strategy. Pure function of (pool, options) -> ordered set.
 * Keep it deterministic where possible so results are reproducible.
 */
export interface SetGenerator {
  /** Unique id, e.g. "greedy-harmonic" or "rafale-private". */
  id: string;
  /** Human label for pickers. */
  label: string;
  /** Optional one-line description shown in UIs. */
  description?: string;
  generate(pool: Track[], options: GenerateOptions): GeneratedSet;
}

/** Default energy arc: warm-up, build to a peak ~78% in, ease out. */
export function defaultEnergyArc(t: number): number {
  const peak = 0.78;
  const curve = t <= peak ? t / peak : 1 - (t - peak) / (1 - peak) / 1.6;
  return 1 + curve * 4; // 1..5
}
