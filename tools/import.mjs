#!/usr/bin/env node
/**
 * import.mjs — bring an existing library into open-crate.
 *
 *   node tools/import.mjs <file.csv|rekordbox.xml> [--keyer "Name"] [--out apps/web/data/crate.json]
 *
 * Digital DJs: this is your on-ramp. Export from Rekordbox (File > Export
 * Collection in xml format) or any app to CSV, and import here. Key + BPM come
 * across if your library already has them, so the set builder works immediately.
 *
 * It reuses @open-crate/core (the same engine the site runs on): the CSV adapter,
 * the Camelot derivation, and the dedupe/merge. Lossless where it can be.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { csvAdapter, mergeTracks, musicalToCamelot, parseCamelot, OCF_VERSION } from "@open-crate/core";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const out = opt("out", "apps/web/data/crate.json");
const keyer = opt("keyer", undefined);

if (!file) {
  console.error("usage: node tools/import.mjs <file.csv|rekordbox.xml> [--keyer Name] [--out path]");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
const isXml = file.toLowerCase().endsWith(".xml") || raw.trimStart().startsWith("<");

/** Minimal Rekordbox collection XML reader: flat <TRACK .../> attributes. */
function parseRekordbox(xml) {
  const tracks = [];
  const warnings = [];
  // Rekordbox stores the collection as self-closing <TRACK ... /> elements.
  const re = /<TRACK\b([^>]*?)\/>/gs;
  const attr = (s, name) => {
    const m = new RegExp(`\\b${name}="([^"]*)"`).exec(s);
    return m ? decode(m[1]) : null;
  };
  const decode = (s) =>
    s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  let m;
  while ((m = re.exec(xml))) {
    const a = m[1];
    const name = attr(a, "Name");
    const artist = attr(a, "Artist");
    if (!name || !artist) { warnings.push("Skipped a TRACK with no Name/Artist."); continue; }
    const tonality = attr(a, "Tonality"); // may be musical ("Fm") or Camelot
    const camelot = parseCamelot(tonality) ? tonality : musicalToCamelot(tonality);
    const bpm = attr(a, "AverageBpm");
    tracks.push({
      artist,
      title: name,
      mix: attr(a, "Mix") || attr(a, "Remixer") || null,
      year: Number(attr(a, "Year")) || null,
      label: attr(a, "Label") || null,
      genre: attr(a, "Genre") || null,
      bpm: bpm ? Math.round(Number(bpm)) : null,
      key_musical: tonality || null,
      key_camelot: camelot || null,
      source: "digital",
      location: attr(a, "Location") || null,
    });
  }
  return { tracks, warnings };
}

const { tracks: incoming, warnings } =
  isXml ? parseRekordbox(raw) : csvAdapter.parse(raw, file);

warnings.forEach((w) => console.warn("⚠ " + w));
if (!incoming.length) {
  console.error("No tracks found. Check the file format.");
  process.exit(1);
}

const crate = existsSync(out)
  ? JSON.parse(readFileSync(out, "utf8"))
  : { ocf: OCF_VERSION, meta: { name: "My Crate", target: 300 }, tracks: [], keyers: [] };

const { tracks, added, skipped } = mergeTracks(crate.tracks ?? [], incoming, { keyer });
crate.tracks = tracks;
writeFileSync(out, JSON.stringify(crate, null, 2) + "\n");

console.log(`Imported ${incoming.length} from ${file}: +${added} new, ${skipped} duplicate(s) skipped.`);
console.log(`Crate now holds ${tracks.length} records -> ${out}`);
const keyed = tracks.filter((t) => t.key_camelot).length;
console.log(`${keyed}/${tracks.length} have a Camelot key (only keyed tracks enter the set builder).`);
