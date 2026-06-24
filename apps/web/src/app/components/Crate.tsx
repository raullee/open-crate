"use client";

import { useMemo, useState } from "react";
import type { Track } from "@/lib/crate";
import { camelotRank, harmonicNeighbours } from "@/lib/crate";
import styles from "../crate.module.css";

type SortKey = "artist" | "bpm" | "year" | "key" | "recent";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "artist", label: "Artist" },
  { value: "bpm", label: "BPM" },
  { value: "key", label: "Key" },
  { value: "year", label: "Year" },
  { value: "recent", label: "Recently added" },
];

/** Position on the Camelot wheel -> a hue, so each key reads as its own colour. */
function camelotHue(code?: string | null): number {
  const match = /^(\d{1,2})([AB])$/i.exec((code ?? "").trim());
  if (!match) return 0;
  return ((Number(match[1]) - 1) / 12) * 360;
}

function haystack(t: Track): string {
  return [t.artist, t.title, t.mix, t.label, t.catno, t.genre, t.style, t.year]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function Crate({ tracks }: { tracks: Track[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("artist");
  const [mixFrom, setMixFrom] = useState<string | null>(null);

  const neighbours = useMemo(() => harmonicNeighbours(mixFrom), [mixFrom]);

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = tracks.filter((t) => (q ? haystack(t).includes(q) : true));
    if (mixFrom) {
      rows = rows.filter((t) => t.key_camelot && neighbours.has(t.key_camelot.toUpperCase()));
    }
    const by: Record<SortKey, (a: Track, b: Track) => number> = {
      artist: (a, b) =>
        a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title),
      bpm: (a, b) => (a.bpm ?? 1e9) - (b.bpm ?? 1e9),
      year: (a, b) => (b.year ?? 0) - (a.year ?? 0),
      key: (a, b) => camelotRank(a.key_camelot) - camelotRank(b.key_camelot),
      recent: (a, b) => (b.added_at ?? "").localeCompare(a.added_at ?? ""),
    };
    return [...rows].sort(by[sort]);
  }, [tracks, query, sort, mixFrom, neighbours]);

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search artist, title, label…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the crate"
        />
        <label className={styles.sort}>
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mixFrom && (
        <button className={styles.mixPill} onClick={() => setMixFrom(null)}>
          Mixing from <strong>{mixFrom}</strong> · {view.length} compatible · clear ✕
        </button>
      )}

      <ol className={styles.list}>
        {view.map((t, i) => {
          const needsKey = !t.key_camelot;
          return (
            <li key={`${t.artist}-${t.title}-${t.mix ?? ""}-${i}`} className={styles.row}>
              <div className={styles.main}>
                <div className={styles.titleLine}>
                  <span className={styles.artist}>{t.artist}</span>
                  <span className={styles.dash}>—</span>
                  <span className={styles.trackTitle}>{t.title}</span>
                  {t.mix && <span className={styles.mix}>({t.mix})</span>}
                </div>
                <div className={styles.meta}>
                  {t.label && <span>{t.label}</span>}
                  {t.catno && <span className={styles.catno}>{t.catno}</span>}
                  {t.country && <span>{t.country}</span>}
                  {t.style && <span className={styles.style}>{t.style}</span>}
                  {t.discogs_url && (
                    <a href={t.discogs_url} target="_blank" rel="noreferrer" className={styles.link}>
                      Discogs ↗
                    </a>
                  )}
                  {needsKey && <span className={styles.pending}>needs key</span>}
                </div>
              </div>

              <div className={styles.tech}>
                <span className={styles.year}>{t.year ?? "—"}</span>
                <span className={styles.bpm}>{t.bpm ? `${t.bpm}` : "—"}</span>
                {t.key_camelot ? (
                  <button
                    className={styles.key}
                    style={{ "--hue": `${camelotHue(t.key_camelot)}` } as React.CSSProperties}
                    onClick={() =>
                      setMixFrom((prev) =>
                        prev === t.key_camelot!.toUpperCase() ? null : t.key_camelot!.toUpperCase(),
                      )
                    }
                    title={`${t.key_musical ?? ""} — click to find harmonic matches`}
                  >
                    {t.key_camelot.toUpperCase()}
                  </button>
                ) : (
                  <span className={styles.keyEmpty}>—</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {view.length === 0 && (
        <p className={styles.empty}>Nothing matches that. Clear the search to see the full crate.</p>
      )}
    </div>
  );
}
