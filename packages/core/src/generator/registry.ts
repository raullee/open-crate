/**
 * Generator registry. Register strategies by id, resolve them at runtime. This
 * is how a private/custom generator becomes selectable without touching core.
 *
 *   import { registerGenerator, generateSet } from "@open-crate/core";
 *   import { myPrivateGenerator } from "./rafale-private"; // not in this repo
 *   registerGenerator(myPrivateGenerator);
 *   const set = generateSet(pool, { count: 12, mode: "smooth" }, "rafale-private");
 */

import type { Track } from "../schema/types.js";
import type { GenerateOptions, GeneratedSet, SetGenerator } from "./types.js";
import { greedyHarmonicGenerator } from "./greedy.js";

const registry = new Map<string, SetGenerator>();

export function registerGenerator(gen: SetGenerator): void {
  registry.set(gen.id, gen);
}

export function getGenerator(id: string): SetGenerator | undefined {
  return registry.get(id);
}

export function listGenerators(): SetGenerator[] {
  return [...registry.values()];
}

/** The id used when none is specified. */
export const DEFAULT_GENERATOR_ID = greedyHarmonicGenerator.id;

// Register the open default on import.
registerGenerator(greedyHarmonicGenerator);

/**
 * Convenience entry point. Resolves the generator by id (default if omitted),
 * throws a clear error if an unknown id is requested.
 */
export function generateSet(
  pool: Track[],
  options: GenerateOptions,
  generatorId: string = DEFAULT_GENERATOR_ID,
): GeneratedSet {
  const gen = registry.get(generatorId);
  if (!gen) {
    throw new Error(
      `Unknown generator "${generatorId}". Registered: ${[...registry.keys()].join(", ") || "(none)"}.`,
    );
  }
  return gen.generate(pool, options);
}
