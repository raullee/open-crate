/**
 * Camelot wheel notation + conversions. No maintained, permissively-licensed
 * Camelot library exists on npm (the few that do are AGPL or abandoned), so this
 * is a clean MIT reimplementation, ~150 lines, zero deps.
 *
 * Camelot: 1-12 around a wheel, A = minor, B = major. One step round the wheel
 * is a perfect fifth. That single fact powers the whole harmonic engine.
 */

export type CamelotLetter = "A" | "B";
export interface Camelot {
  num: number; // 1..12
  letter: CamelotLetter;
}

/** Parse "8A" / "8a" / " 8A " -> {num, letter}, or null if invalid. */
export function parseCamelot(code?: string | null): Camelot | null {
  const m = /^(\d{1,2})\s*([AB])$/i.exec((code ?? "").trim());
  if (!m) return null;
  const num = Number(m[1]);
  if (num < 1 || num > 12) return null;
  return { num, letter: m[2].toUpperCase() as CamelotLetter };
}

export function formatCamelot(c: Camelot): string {
  return `${c.num}${c.letter}`;
}

/** Sort rank: number then letter (A before B). Useful for stable UI ordering. */
export function camelotRank(code?: string | null): number {
  const c = parseCamelot(code);
  if (!c) return 999;
  return c.num * 2 + (c.letter === "B" ? 1 : 0);
}

const WRAP = (n: number) => ((n - 1 + 12) % 12) + 1;

/**
 * Energy-safe neighbours: same key, relative major/minor, and one step either
 * way round the wheel. The standard set every DJ tool flags green.
 */
export function harmonicNeighbours(code?: string | null): string[] {
  const c = parseCamelot(code);
  if (!c) return [];
  const other: CamelotLetter = c.letter === "A" ? "B" : "A";
  return [
    `${c.num}${c.letter}`,
    `${c.num}${other}`,
    `${WRAP(c.num + 1)}${c.letter}`,
    `${WRAP(c.num - 1)}${c.letter}`,
  ];
}

export function areCompatible(a?: string | null, b?: string | null): boolean {
  const cb = parseCamelot(b);
  if (!cb) return false;
  return harmonicNeighbours(a).includes(formatCamelot(cb));
}

// ---------- conversions: musical key <-> Camelot <-> Open Key ----------

const MUSICAL_TO_CAMELOT: Record<string, string> = {
  "A Minor": "8A", "B Minor": "10A", "C Minor": "5A", "D Minor": "7A",
  "E Minor": "9A", "F Minor": "4A", "G Minor": "6A",
  "A# Minor": "3A", "Bb Minor": "3A", "C# Minor": "12A", "Db Minor": "12A",
  "D# Minor": "2A", "Eb Minor": "2A", "F# Minor": "11A", "Gb Minor": "11A",
  "G# Minor": "1A", "Ab Minor": "1A",
  "C Major": "8B", "D Major": "10B", "E Major": "12B", "F Major": "7B",
  "G Major": "9B", "A Major": "11B", "B Major": "1B",
  "C# Major": "3B", "Db Major": "3B", "D# Major": "5B", "Eb Major": "5B",
  "F# Major": "2B", "Gb Major": "2B", "G# Major": "4B", "Ab Major": "4B",
  "A# Major": "6B", "Bb Major": "6B",
};

/** Normalise loose musical-key text ("Fm", "F min", "F MINOR") to Camelot. */
export function musicalToCamelot(key?: string | null): string | null {
  if (!key) return null;
  let k = key.trim().replace(/\s+/g, " ");
  // Expand shorthands: "Fm" -> "F Minor", "F" alone -> "F Major".
  const m = /^([A-G][#b]?)\s*(maj(or)?|min(or)?|m|M)?$/i.exec(k);
  if (m) {
    const note = m[1].charAt(0).toUpperCase() + m[1].slice(1).replace("B", "b");
    const q = (m[2] || "").toLowerCase();
    const minor = q === "m" || q.startsWith("min");
    k = `${note} ${minor ? "Minor" : "Major"}`;
  }
  return MUSICAL_TO_CAMELOT[k] ?? null;
}

const CAMELOT_TO_MUSICAL: Record<string, string> = Object.fromEntries(
  Object.entries(MUSICAL_TO_CAMELOT).map(([k, v]) => [v, k]),
);

export function camelotToMusical(code?: string | null): string | null {
  const c = parseCamelot(code);
  return c ? CAMELOT_TO_MUSICAL[formatCamelot(c)] ?? null : null;
}

/**
 * Open Key Notation (Mixed In Key's other system): same number mapping, m=minor,
 * d=major, rotated by +5 from... actually: Camelot nA == OpenKey ((n+7)%12 or 12)m.
 * Provided for interop with tools that display Open Key.
 */
export function camelotToOpenKey(code?: string | null): string | null {
  const c = parseCamelot(code);
  if (!c) return null;
  const okNum = WRAP(c.num + 5);
  return `${okNum}${c.letter === "A" ? "m" : "d"}`;
}
