import { describe, expect, it } from "vitest";
import {
  parseCamelot,
  harmonicNeighbours,
  areCompatible,
  musicalToCamelot,
  camelotToOpenKey,
  camelotTransition,
  generateSet,
  planTrackCount,
  mergeTracks,
  registerGenerator,
  listGenerators,
  type Track,
} from "./index.js";

describe("camelot", () => {
  it("parses and rejects", () => {
    expect(parseCamelot("8A")).toEqual({ num: 8, letter: "A" });
    expect(parseCamelot("8a")).toEqual({ num: 8, letter: "A" });
    expect(parseCamelot("13A")).toBeNull();
    expect(parseCamelot("foo")).toBeNull();
  });

  it("knows energy-safe neighbours and wraps the wheel", () => {
    expect(harmonicNeighbours("8A").sort()).toEqual(["7A", "8A", "8B", "9A"].sort());
    expect(harmonicNeighbours("1A")).toContain("12A"); // wrap below
    expect(harmonicNeighbours("12A")).toContain("1A"); // wrap above
    expect(areCompatible("8A", "9A")).toBe(true);
    expect(areCompatible("8A", "2A")).toBe(false);
  });

  it("converts musical key and open key", () => {
    expect(musicalToCamelot("A Minor")).toBe("8A");
    expect(musicalToCamelot("Fm")).toBe("4A");
    expect(musicalToCamelot("C")).toBe("8B");
    expect(camelotToOpenKey("8A")).toBe("1m");
  });
});

describe("harmonic transitions", () => {
  it("scores a perfect match highest", () => {
    expect(camelotTransition("8A", "8A").smoothness).toBe(100);
  });
  it("scores a tritone as max tension", () => {
    const t = camelotTransition("8A", "2A");
    expect(t.key).toBe("tritone");
    expect(t.tension).toBeGreaterThan(90);
  });
  it("derives the right semitone interval (one wheel step = a fifth)", () => {
    expect(camelotTransition("8A", "9A").semitones).toBe(7 - 12); // -5, a fourth down (== fifth up mod oct)
  });
});

const pool: Track[] = [
  { artist: "A", title: "1", key_camelot: "8A", bpm: 128, energy: 1 },
  { artist: "B", title: "2", key_camelot: "9A", bpm: 128, energy: 2 },
  { artist: "C", title: "3", key_camelot: "10A", bpm: 129, energy: 3 },
  { artist: "D", title: "4", key_camelot: "11A", bpm: 130, energy: 4 },
  { artist: "E", title: "5", key_camelot: "8B", bpm: 128, energy: 5 },
  { artist: "F", title: "6", key_camelot: null, bpm: null }, // unplayable, must be skipped
];

describe("generator", () => {
  it("plans track count from duration", () => {
    expect(planTrackCount(60, 45, 5).tracks).toBeGreaterThan(8);
  });

  it("builds a set, skips unkeyed tracks, respects count", () => {
    const set = generateSet(pool, { count: 4, mode: "smooth" });
    expect(set.steps.length).toBe(4);
    expect(set.steps.every((s) => s.track.key_camelot)).toBe(true);
    expect(set.generator).toBe("greedy-harmonic");
  });

  it("honours locked openers", () => {
    const locked = [pool[3]]; // "D"
    const set = generateSet(pool, { count: 3, mode: "smooth", locked });
    expect(set.steps[0].track.title).toBe("4");
  });

  it("lets a custom generator be registered and resolved", () => {
    registerGenerator({
      id: "reverse",
      label: "Reverse test",
      generate: (p, o) => ({
        generator: "reverse",
        steps: p.slice(0, o.count).reverse().map((track) => ({ track, transition: null })),
      }),
    });
    expect(listGenerators().some((g) => g.id === "reverse")).toBe(true);
    const set = generateSet(pool, { count: 2, mode: "smooth" }, "reverse");
    expect(set.generator).toBe("reverse");
  });

  it("throws clearly on an unknown generator id", () => {
    expect(() => generateSet(pool, { count: 2, mode: "smooth" }, "nope")).toThrow(/Unknown generator/);
  });
});

describe("crate ops", () => {
  it("dedupes on merge and stamps keyer only on new rows", () => {
    const existing: Track[] = [{ artist: "A", title: "1" }];
    const incoming: Track[] = [
      { artist: "A", title: "1" }, // dup
      { artist: "Z", title: "9" }, // new
    ];
    const { tracks, added, skipped } = mergeTracks(existing, incoming, { keyer: "Sam" });
    expect(added).toBe(1);
    expect(skipped).toBe(1);
    expect(tracks.find((t) => t.title === "9")?.keyer).toBe("Sam");
    expect(tracks.find((t) => t.title === "1")?.keyer).toBeUndefined();
  });
});
