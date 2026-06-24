/**
 * The Open Crate Format (OCF) — a small, portable schema for a DJ/record
 * collection. The whole point: if enough tools read and write this shape, your
 * library stops being held hostage by any one app. Plain JSON, file-embeddable,
 * version-controllable, diff-friendly.
 *
 * Design rule: every field except `artist` and `title` is optional. A crate full
 * of half-known vinyl is still a valid crate. Tools enrich progressively.
 */

/** Semver of the format itself, so readers can adapt. Bump on breaking changes. */
export const OCF_VERSION = "1.0.0" as const;

/**
 * A single record/track. Source-agnostic: it can describe a vinyl pressing, a
 * digital file, or a streaming entry. `source` says which.
 */
export interface Track {
  /** REQUIRED. */
  artist: string;
  /** REQUIRED. */
  title: string;

  /** Mix / remix / version, e.g. "Airwave Remix". Distinct from title. */
  mix?: string | null;
  year?: number | null;
  label?: string | null;
  /** Catalogue number — the reliable identity key for vinyl. */
  catno?: string | null;
  country?: string | null;
  genre?: string | null;
  style?: string | null;

  /** Beats per minute. Null until analysed. */
  bpm?: number | null;
  /** Musical key as text, e.g. "F Minor". Human-readable mirror of camelot. */
  key_musical?: string | null;
  /** Camelot code, e.g. "4A". The field the harmonic engine actually uses. */
  key_camelot?: string | null;

  /**
   * Energy 1-5 (warm-up..peak). Optional and ALWAYS user-overridable; the
   * research is blunt that DJs reject computed energy as a verdict but accept it
   * as an editable default.
   */
  energy?: number | null;
  /** Free role hint, e.g. "opener" | "peak" | "closer". Advisory only. */
  role?: string | null;

  /** Where this entry came from. */
  source?: "vinyl" | "digital" | "stream" | null;
  /** Original file path / URI for digital, or null for vinyl. */
  location?: string | null;

  /** Discogs release URL (or any canonical reference). */
  discogs_url?: string | null;
  /** Discogs/MusicBrainz id if known. */
  release_id?: string | null;

  /** Free tags. One track can live in many buckets. */
  tags?: string[];

  /** ISO-8601 when this entry was added/keyed. Drives the "latest" feed. */
  added_at?: string | null;
  /** Who catalogued it — credit + the social leaderboard. */
  keyer?: string | null;

  /** Confidence (0-1) of the key/bpm analysis, so UIs can flag low trust. */
  analysis_confidence?: number | null;

  /** Escape hatch for tool-specific data without breaking the schema. */
  ext?: Record<string, unknown>;
}

/** A person who catalogued part of the crate. Powers the diggers leaderboard. */
export interface Keyer {
  name: string;
  /** 2-letter badge. */
  short: string;
  /** Records read aloud / catalogued — the headline effort metric. */
  recordsRead: number;
  note?: string;
  /** Hex accent for the badge. */
  accent?: string;
  owner?: boolean;
  firstAt?: string;
}

/** The whole collection document. This is the file you commit / share / export. */
export interface Crate {
  /** Must match OCF_VERSION major for safe reads. */
  ocf: string;
  /** Optional collection metadata. */
  meta?: {
    name?: string;
    owner?: string;
    /** Aspirational size, used for a "the climb" progress UI (never a 100% bar). */
    target?: number;
  };
  tracks: Track[];
  keyers?: Keyer[];
}

/** A stable id for dedupe / set membership. Case- and space-insensitive. */
export function trackId(t: Pick<Track, "artist" | "title" | "mix">): string {
  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return `${norm(t.artist)}|${norm(t.title)}|${norm(t.mix)}`;
}

/** True if a value is a usable Track (has the two required fields). */
export function isTrack(t: Partial<Track> | null | undefined): t is Track {
  return !!t && typeof t.artist === "string" && !!t.artist && typeof t.title === "string" && !!t.title;
}
