/**
 * Pluggable I/O. Two interfaces let the ecosystem grow without touching core:
 *
 *  - ImportAdapter: turn some external library format (Rekordbox XML, Serato,
 *    a CSV, a Discogs export) into OCF Tracks. This is the on-ramp; the research
 *    is blunt that lossy import is why DJs refuse to switch tools, so adapters
 *    should preserve everything they can and never silently drop data.
 *
 *  - EnrichmentProvider: given a Track, fill in missing key/bpm/metadata. Wrap
 *    Discogs, MusicBrainz, a local key detector, GetSongBPM, whatever. Providers
 *    should be honest about confidence so UIs can flag low-trust analysis.
 */

import type { Track } from "../schema/types.js";

export interface ImportResult {
  tracks: Track[];
  /** Non-fatal issues (skipped rows, unmapped fields) for transparent reporting. */
  warnings: string[];
}

export interface ImportAdapter {
  id: string;
  label: string;
  /** Does this adapter recognise the input? Cheap sniff (extension, header). */
  sniff?(input: string, filename?: string): boolean;
  /** Parse raw text (file contents) into OCF tracks. */
  parse(input: string, filename?: string): ImportResult;
}

export interface EnrichmentResult {
  /** Partial fields to merge onto the track. */
  patch: Partial<Track>;
  /** 0-1 confidence in the patch, surfaced to the user. */
  confidence: number;
  /** Where the data came from, for provenance. */
  source: string;
  note?: string;
}

export interface EnrichmentProvider {
  id: string;
  label: string;
  /** Which fields this provider can supply, e.g. ["bpm","key_camelot"]. */
  provides: (keyof Track)[];
  enrich(track: Track): Promise<EnrichmentResult | null>;
}
