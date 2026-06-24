#!/usr/bin/env node
/**
 * enrich.mjs — the vinyl / voice path. Turn a plain list of records into a
 * keyed crate. This is the "minimal human energy" route the README describes:
 * speak your shelf, transcribe it, drop the lines here, walk away.
 *
 *   node tools/enrich.mjs records.txt [--keyer "Name"] [--out apps/web/data/crate.json]
 *
 * records.txt = one record per line, e.g.
 *   Energy 52 - Café Del Mar
 *   Gouryella - Walhalla (Original Mix)
 *
 * For each line it queries the free Discogs API for the release (year, label,
 * catalogue number, country, genre, style, a canonical URL). If you also set
 * GETSONGBPM_API_KEY it will try to attach BPM + key (-> Camelot). No keys?
 * It still catalogues everything; key/BPM stay null until you fill them in or
 * import a digital library that already has them.
 *
 * Tokens (free):
 *   DISCOGS_USER_TOKEN   https://www.discogs.com/settings/developers
 *   GETSONGBPM_API_KEY   https://getsongbpm.com/api   (optional; requires a
 *                        backlink to getsongbpm.com per their terms)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { mergeTracks, musicalToCamelot, OCF_VERSION } from "@open-crate/core";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const out = opt("out", "apps/web/data/crate.json");
const keyer = opt("keyer", undefined);

const DISCOGS = process.env.DISCOGS_USER_TOKEN;
const SONGBPM = process.env.GETSONGBPM_API_KEY;
const UA = "open-crate/0.1 (+https://github.com/raullee/open-crate)";

if (!file) { console.error("usage: node tools/enrich.mjs records.txt [--keyer Name] [--out path]"); process.exit(1); }
if (!DISCOGS) console.warn("⚠ No DISCOGS_USER_TOKEN set — metadata lookup will be skipped (records still added).");

const lines = readFileSync(file, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));

/** Split "Artist - Title (Mix)" loosely. */
function parseLine(line) {
  const [left, ...rest] = line.split(" - ");
  const artist = left.trim();
  let title = rest.join(" - ").trim() || line;
  let mix = null;
  const mm = /\(([^)]+)\)\s*$/.exec(title);
  if (mm) { mix = mm[1].trim(); title = title.replace(/\([^)]+\)\s*$/, "").trim(); }
  return { artist, title, mix };
}

async function discogs(artist, title) {
  if (!DISCOGS) return null;
  const url = new URL("https://api.discogs.com/database/search");
  url.searchParams.set("artist", artist);
  url.searchParams.set("track", title);
  url.searchParams.set("type", "release");
  url.searchParams.set("per_page", "5");
  url.searchParams.set("token", DISCOGS);
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (r.status === 429) { await sleep(2000); return discogs(artist, title); }
  if (!r.ok) return null;
  const data = await r.json();
  const hit = (data.results || []).find((x) => x.title) || null;
  if (!hit) return null;
  const first = (s) => (Array.isArray(s) ? s[0] : s) || null;
  return {
    year: hit.year ? Number(hit.year) : null,
    label: first(hit.label),
    catno: hit.catno || null,
    country: hit.country || null,
    genre: first(hit.genre),
    style: first(hit.style),
    discogs_url: hit.uri ? `https://www.discogs.com${hit.uri}` : null,
    release_id: hit.id ? String(hit.id) : null,
  };
}

async function songbpm(artist, title) {
  if (!SONGBPM) return null;
  const url = new URL("https://api.getsong.co/search/");
  url.searchParams.set("api_key", SONGBPM);
  url.searchParams.set("type", "both");
  url.searchParams.set("lookup", `song:${title} artist:${artist}`);
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  const hit = data?.search?.[0];
  if (!hit) return null;
  const camelot = hit.key_of ? musicalToCamelot(hit.key_of) : null;
  return {
    bpm: hit.tempo ? Math.round(Number(hit.tempo)) : null,
    key_musical: hit.key_of || null,
    key_camelot: camelot,
  };
}

const incoming = [];
const today = new Date().toISOString();
for (let i = 0; i < lines.length; i++) {
  const { artist, title, mix } = parseLine(lines[i]);
  process.stdout.write(`[${i + 1}/${lines.length}] ${artist} - ${title}${mix ? ` (${mix})` : ""} … `);
  const meta = await discogs(artist, title).catch(() => null);
  const tech = await songbpm(artist, title).catch(() => null);
  incoming.push({ artist, title, mix: mix || null, source: "vinyl", added_at: today, ...meta, ...tech });
  console.log(meta ? "matched" : "added (no metadata)");
  if (DISCOGS) await sleep(1200); // be kind to the Discogs rate limit
}

const crate = existsSync(out)
  ? JSON.parse(readFileSync(out, "utf8"))
  : { ocf: OCF_VERSION, meta: { name: "My Crate", target: 300 }, tracks: [], keyers: [] };
const { tracks, added, skipped } = mergeTracks(crate.tracks ?? [], incoming, { keyer });
crate.tracks = tracks;
writeFileSync(out, JSON.stringify(crate, null, 2) + "\n");

console.log(`\nDone: +${added} new, ${skipped} duplicate(s) skipped. Crate holds ${tracks.length}. -> ${out}`);
const keyed = tracks.filter((t) => t.key_camelot).length;
console.log(`${keyed}/${tracks.length} have a Camelot key. Set GETSONGBPM_API_KEY to raise that, or fill keys by hand.`);
