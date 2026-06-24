/**
 * The app's data layer. Reads one Open Crate Format file (data/crate.json) at
 * build time and re-exposes the engine's derivations under the names the UI
 * already uses. No server, no runtime DB: the crate is static, so pages are
 * instant and there is nothing to hack. Re-deploy = re-read the JSON.
 *
 * To use your own collection, replace data/crate.json (see /tools to generate it).
 */
import crateData from "../../data/crate.json";
import {
  camelotRank as coreCamelotRank,
  harmonicNeighbours as coreNeighbours,
  crateStats,
  leaderboard,
  recentlyAdded,
  isTrack,
  type Crate,
  type Track,
  type Keyer,
} from "@open-crate/core";

export type { Track, Keyer };

const crate = crateData as unknown as Crate;

export const COLLECTION_TARGET = crate.meta?.target ?? 300;

export function getTracks(): Track[] {
  return crate.tracks.filter(isTrack);
}

export function getKeyers() {
  return leaderboard(crate);
}

export function getStats() {
  return crateStats(crate);
}

export function getRecentlyKeyed(n = 8): Track[] {
  return recentlyAdded(crate, n);
}

export const camelotRank = coreCamelotRank;

/** Set wrapper so existing `.has()` call sites keep working unchanged. */
export function harmonicNeighbours(code?: string | null): Set<string> {
  return new Set(coreNeighbours(code));
}
