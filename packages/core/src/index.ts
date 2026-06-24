/**
 * @open-crate/core — the framework-agnostic, zero-dependency engine behind
 * open-crate. Catalogue schema, Camelot/harmonic theory, a swappable
 * set-generator, and pluggable import/enrichment adapters.
 *
 * MIT. Use it in a web app, a CLI, a bot, a plugin — anywhere JS/TS runs.
 */

// Schema — the portable Open Crate Format.
export {
  OCF_VERSION,
  trackId,
  isTrack,
  type Track,
  type Keyer,
  type Crate,
} from "./schema/types.js";

// Camelot notation + conversions.
export {
  parseCamelot,
  formatCamelot,
  camelotRank,
  harmonicNeighbours,
  areCompatible,
  musicalToCamelot,
  camelotToMusical,
  camelotToOpenKey,
  type Camelot,
  type CamelotLetter,
} from "./camelot/camelot.js";

// Harmonic transition scoring.
export { camelotTransition, type Transition } from "./harmonic/harmonic.js";

// The swappable generator: interface, registry, default v1.
export {
  defaultEnergyArc,
  type SetGenerator,
  type GenerateOptions,
  type GeneratedSet,
  type SetStep,
  type Mode,
} from "./generator/types.js";
export { greedyHarmonicGenerator } from "./generator/greedy.js";
export {
  registerGenerator,
  getGenerator,
  listGenerators,
  generateSet,
  DEFAULT_GENERATOR_ID,
} from "./generator/registry.js";

// Pluggable I/O.
export {
  type ImportAdapter,
  type ImportResult,
  type EnrichmentProvider,
  type EnrichmentResult,
} from "./adapters/types.js";
export { csvAdapter, parseCsv } from "./adapters/csv.js";

// Crate operations.
export {
  planTrackCount,
  setRuntimeMin,
  mergeTracks,
  leaderboard,
  crateStats,
  recentlyAdded,
  type MixPlan,
} from "./util/crate-ops.js";
