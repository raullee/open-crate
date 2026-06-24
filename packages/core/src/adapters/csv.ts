/**
 * Reference ImportAdapter: a forgiving CSV reader. The universal on-ramp — any
 * spreadsheet, Discogs collection export, or hand-typed list. Header names are
 * matched loosely (case-insensitive, common aliases) so people don't have to
 * reshape their file. Unmapped columns are preserved in `ext`.
 */

import type { Track } from "../schema/types.js";
import { musicalToCamelot, parseCamelot } from "../camelot/camelot.js";
import type { ImportAdapter, ImportResult } from "./types.js";

/** Minimal RFC-4180-ish CSV parse (handles quotes, commas, newlines in quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { rows.push(row); row = []; };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ",") { pushField(); i++; continue; }
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { pushField(); pushRow(); i++; continue; }
    field += ch; i++;
  }
  if (field.length || row.length) { pushField(); pushRow(); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const ALIASES: Record<keyof Track | "key", string[]> = {
  artist: ["artist", "artists", "artist name"],
  title: ["title", "track", "track title", "name", "song"],
  mix: ["mix", "remix", "version", "mix name"],
  year: ["year", "released"],
  label: ["label", "publisher"],
  catno: ["catno", "cat#", "catalog#", "catalog number", "catalogue number"],
  country: ["country"],
  genre: ["genre"],
  style: ["style", "styles"],
  bpm: ["bpm", "tempo"],
  key_musical: ["key", "musical key", "key (musical)"],
  key_camelot: ["camelot", "key_camelot", "camelot key"],
  energy: ["energy"],
  tags: ["tags", "comment", "comments"],
  added_at: ["added", "added_at", "date added"],
  keyer: ["keyer", "added by", "digger"],
  // unused-but-declared to satisfy the map shape:
  role: ["role"], source: ["source"], location: ["location", "path", "file"],
  discogs_url: ["discogs", "discogs_url", "url"], release_id: ["release_id", "discogs id"],
  analysis_confidence: ["confidence"], ext: [], key: ["key"],
};

function buildHeaderMap(header: string[]): Record<number, keyof Track | "key"> {
  const map: Record<number, keyof Track | "key"> = {};
  header.forEach((raw, idx) => {
    const h = raw.trim().toLowerCase();
    for (const [field, names] of Object.entries(ALIASES)) {
      if (names.includes(h)) { map[idx] = field as keyof Track | "key"; return; }
    }
  });
  return map;
}

export const csvAdapter: ImportAdapter = {
  id: "csv",
  label: "CSV / spreadsheet",
  sniff: (_input, filename) => !!filename?.toLowerCase().endsWith(".csv"),

  parse(input: string): ImportResult {
    const rows = parseCsv(input);
    const warnings: string[] = [];
    if (rows.length < 2) return { tracks: [], warnings: ["CSV had no data rows."] };

    const header = rows[0];
    const map = buildHeaderMap(header);
    if (!Object.values(map).includes("artist") || !Object.values(map).includes("title")) {
      warnings.push('CSV needs at least "artist" and "title" columns.');
      return { tracks: [], warnings };
    }

    const tracks: Track[] = [];
    rows.slice(1).forEach((cells, r) => {
      const t: Partial<Track> & { ext?: Record<string, unknown> } = { ext: {} };
      cells.forEach((val, idx) => {
        const v = val.trim();
        if (!v) return;
        const field = map[idx];
        if (!field) { t.ext![header[idx] || `col${idx}`] = v; return; }
        switch (field) {
          case "year": case "bpm": t[field] = Number(v) || null; break;
          case "energy": case "analysis_confidence": t[field] = Number(v) || null; break;
          case "tags": t.tags = v.split(/[;|]/).map((s) => s.trim()).filter(Boolean); break;
          case "key": t.key_musical = v; break; // resolved to camelot below
          default: (t as Record<string, unknown>)[field] = v;
        }
      });
      // Derive Camelot from a musical key if camelot wasn't supplied directly.
      if (!t.key_camelot && t.key_musical) {
        t.key_camelot = parseCamelot(t.key_musical) ? t.key_musical : musicalToCamelot(t.key_musical);
      }
      if (t.ext && Object.keys(t.ext).length === 0) delete t.ext;
      if (t.artist && t.title) tracks.push(t as Track);
      else warnings.push(`Row ${r + 2} skipped: missing artist or title.`);
    });

    return { tracks, warnings };
  },
};
