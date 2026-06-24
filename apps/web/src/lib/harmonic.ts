/**
 * Thin re-export of the harmonic engine from @open-crate/core, keeping the names
 * the UI already imports. `generateSet` returns the steps array directly (the
 * shape the SetBuilder expects); everything else passes straight through.
 *
 * This file is intentionally tiny: the real logic lives in the published engine,
 * so the reference app and any other consumer share one implementation.
 */
import {
  generateSet as coreGenerateSet,
  type GenerateOptions,
  type SetStep,
  type Track,
} from "@open-crate/core";

export {
  camelotTransition,
  parseCamelot,
  planTrackCount,
  setRuntimeMin,
  type Mode,
  type SetStep,
  type Transition,
} from "@open-crate/core";

/** Generate a set and return just the ordered steps (UI-friendly shape). */
export function generateSet(
  pool: Track[],
  opts: GenerateOptions,
  generatorId?: string,
): SetStep[] {
  return coreGenerateSet(pool, opts, generatorId).steps;
}
