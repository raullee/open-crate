/**
 * Crate-level operations: set-length maths, dedupe/merge, and leaderboard
 * derivation. Kept pure so both the web app and the CLIs share one source of
 * truth.
 */

import { isTrack, trackId, type Crate, type Keyer, type Track } from "../schema/types.js";

export interface MixPlan {
  minutes: number;
  overlapSec: number;
  avgTrackMin: number;
  tracks: number;
}

/**
 * N tracks each played avgTrackMin with overlapSec crossfades:
 *   total = N*avg - (N-1)*overlap  =>  N = (total - overlap) / (avg - overlap).
 * Overlap of 30-60s is roughly 16-32 bars at 128-140 BPM, the standard blend.
 */
export function planTrackCount(minutes: number, overlapSec: number, avgTrackMin: number): MixPlan {
  const overlapMin = overlapSec / 60;
  const eff = Math.max(0.5, avgTrackMin - overlapMin);
  const tracks = Math.max(1, Math.round((minutes - overlapMin) / eff));
  return { minutes, overlapSec, avgTrackMin, tracks };
}

/** Actual runtime of a finished set, in minutes. */
export function setRuntimeMin(steps: number, overlapSec: number, avgTrackMin: number): number {
  if (steps <= 0) return 0;
  return Math.round(steps * avgTrackMin - (steps - 1) * (overlapSec / 60));
}

/**
 * Merge incoming tracks into a crate. Dedupe by (artist,title,mix). Existing
 * rows win (idempotent re-imports). `keyer` is stamped only on NEW rows. Returns
 * counts so callers can report transparently (added vs skipped).
 */
export function mergeTracks(
  existing: Track[],
  incoming: Track[],
  opts: { keyer?: string } = {},
): { tracks: Track[]; added: number; skipped: number } {
  const seen = new Map(existing.map((t) => [trackId(t), t]));
  let added = 0;
  let skipped = 0;
  for (const raw of incoming) {
    if (!isTrack(raw)) continue;
    const id = trackId(raw);
    if (seen.has(id)) { skipped++; continue; }
    const rec = opts.keyer ? { ...raw, keyer: raw.keyer ?? opts.keyer } : raw;
    seen.set(id, rec);
    added++;
  }
  const tracks = [...seen.values()].sort(
    (a, b) =>
      (a.artist || "").toLowerCase().localeCompare((b.artist || "").toLowerCase()) ||
      (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase()),
  );
  return { tracks, added, skipped };
}

/** Leaderboard with a derived liveCount (records actually in the crate). */
export function leaderboard(crate: Crate): (Keyer & { liveCount: number })[] {
  const live: Record<string, number> = {};
  for (const t of crate.tracks) {
    if (t.keyer) live[t.keyer] = (live[t.keyer] ?? 0) + 1;
  }
  return (crate.keyers ?? [])
    .map((k) => ({ ...k, liveCount: live[k.name] ?? 0 }))
    .sort((a, b) => b.recordsRead - a.recordsRead);
}

/** Headline collection vitals for a hero/dashboard. */
export function crateStats(crate: Crate) {
  const tracks = crate.tracks.filter(isTrack);
  const years = tracks.map((t) => t.year).filter((y): y is number => !!y);
  return {
    live: tracks.length,
    target: crate.meta?.target ?? 300,
    keyed: tracks.filter((t) => t.key_camelot).length,
    withBpm: tracks.filter((t) => t.bpm).length,
    labels: new Set(tracks.map((t) => t.label).filter(Boolean)).size,
    keyers: (crate.keyers ?? []).length,
    totalRead: (crate.keyers ?? []).reduce((s, k) => s + k.recordsRead, 0),
    yearSpan: years.length ? ([Math.min(...years), Math.max(...years)] as const) : null,
  };
}

/** Reverse-chron "latest additions" feed. */
export function recentlyAdded(crate: Crate, n = 8): Track[] {
  return [...crate.tracks.filter((t) => t.added_at)]
    .sort((a, b) => (b.added_at ?? "").localeCompare(a.added_at ?? ""))
    .slice(0, n);
}
