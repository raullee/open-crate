/**
 * Harmonic transition scoring. Goes past the basic Camelot wheel.
 *
 * The wheel's core fact: one step round it (e.g. 8A -> 9A) is a perfect fifth =
 * 7 semitones. So a number-delta `d` between two Camelot keys implies
 * (7*d) mod 12 semitones. That single identity gives every "creative" move its
 * real interval, so we can score BOTH smoothness (dancefloor-safe) and tension
 * (creative interest) for any pair of keys. A generator can then build a safe
 * blend OR a deliberately spicy one from the same data.
 */

import { parseCamelot } from "../camelot/camelot.js";

export interface Transition {
  /** Category id, e.g. "perfect", "fifth_up", "tritone". */
  key: string;
  label: string;
  /** 0-100, dancefloor-safe. */
  smoothness: number;
  /** 0-100, creative interest / risk. */
  tension: number;
  /** Signed semitone interval implied by the move, -5..6. */
  semitones: number;
  /** One-line DJ guidance. */
  note: string;
}

/** Signed semitone interval implied by a Camelot number delta. */
function signedSemitones(dn: number): number {
  const st = (((7 * dn) % 12) + 12) % 12;
  return st > 6 ? st - 12 : st;
}

const SAME_LETTER: Record<number, Omit<Transition, "semitones">> = {
  0: { key: "perfect", label: "Perfect", smoothness: 100, tension: 2, note: "Same key. Seamless, energy held." },
  1: { key: "fifth_up", label: "Energy +1", smoothness: 93, tension: 14, note: "A fifth up. Classic lift, very safe." },
  11: { key: "fifth_down", label: "Energy -1", smoothness: 92, tension: 12, note: "A fifth down. Settles the room, very safe." },
  2: { key: "boost_up", label: "Boost +2st", smoothness: 74, tension: 42, note: "Two-semitone energy boost. Bright lift; mask it on a build." },
  10: { key: "boost_down", label: "Drop -2st", smoothness: 70, tension: 40, note: "Two semitones down. Pulls energy back without going flat." },
  3: { key: "min3_up", label: "Minor 3rd", smoothness: 52, tension: 58, note: "Minor-third move. Colour shift; works under a breakdown." },
  9: { key: "min3_dn", label: "Minor 3rd", smoothness: 52, tension: 56, note: "Minor-third move. Colour shift; works under a breakdown." },
  4: { key: "maj3_up", label: "Major 3rd", smoothness: 44, tension: 64, note: "Major-third jump. Filmic, brave; bridge it with drums." },
  8: { key: "maj3_dn", label: "Major 3rd", smoothness: 44, tension: 62, note: "Major-third jump. Filmic, brave; bridge it with drums." },
  7: { key: "semitone_up", label: "+1 Semitone", smoothness: 28, tension: 84, note: "Semitone lift. The gutsy key-change rush; hide it in a drop." },
  5: { key: "semitone_dn", label: "-1 Semitone", smoothness: 26, tension: 82, note: "Semitone down. Unsettling on purpose; for effect, not the floor." },
  6: { key: "tritone", label: "Tritone", smoothness: 14, tension: 96, note: "Tritone. Maximum clash. A statement, over a beat-only passage." },
};

/** Classify the move between two Camelot keys. Unknown keys -> mix by ear. */
export function camelotTransition(from?: string | null, to?: string | null): Transition {
  const a = parseCamelot(from);
  const b = parseCamelot(to);
  if (!a || !b) {
    return { key: "unknown", label: "Unkeyed", smoothness: 40, tension: 50, semitones: 0, note: "No key data; mix by ear." };
  }
  const dn = (((b.num - a.num) % 12) + 12) % 12;
  const semis = signedSemitones(dn);

  if (a.letter === b.letter) {
    return { ...SAME_LETTER[dn], semitones: semis };
  }

  // Mode change (A<->B).
  if (dn === 0) {
    return { key: "mood", label: "Mood flip", smoothness: 86, tension: 32, semitones: 0, note: "Relative major/minor. Same notes, the mood turns. Very usable." };
  }
  if (dn === 1 || dn === 11) {
    return { key: "diagonal", label: "Diagonal", smoothness: 62, tension: 44, semitones: semis, note: "Diagonal wheel move. Smoother than it looks; a touch of lift." };
  }
  if (dn === 7 || dn === 5) {
    return { key: "energy_mode", label: "Energy + mood", smoothness: 48, tension: 60, semitones: semis, note: "Fifth plus a mode flip. Big lift; keep it intentional." };
  }
  return { key: "cross", label: "Cross-key", smoothness: 30, tension: 78, semitones: semis, note: "Distant cross-key. Creative clash; bridge it or use a breakdown." };
}
