"use client";

import { useEffect, useMemo, useState } from "react";
import type { Track } from "@/lib/crate";
import {
  generateSet,
  planTrackCount,
  type Mode,
  type SetStep,
} from "@/lib/harmonic";
import { site } from "@/site.config";
import styles from "../studio.module.css";

// Light gate over public data; obscurity, not security. Set via NEXT_PUBLIC_STUDIO_PASS.
const PASSPHRASE = site.studioPass;
const DURATIONS = [
  { label: "30–45", min: 40 },
  { label: "60", min: 60 },
  { label: "90", min: 90 },
  { label: "2 hr", min: 120 },
  { label: "3 hr", min: 180 },
];

const tid = (t: Track) => `${t.artist}|${t.title}|${t.mix ?? ""}`;

function smoothColor(s: number) {
  // green (smooth) -> pink (spicy)
  const hue = Math.round((s / 100) * 130);
  return `hsl(${hue} 70% 60%)`;
}

export function SetBuilder({ tracks }: { tracks: Track[] }) {
  const [ok, setOk] = useState(PASSPHRASE === "");
  const [pass, setPass] = useState("");

  useEffect(() => {
    if (!PASSPHRASE) return;
    const urlKey = new URLSearchParams(window.location.search).get("key");
    if (urlKey === PASSPHRASE) {
      localStorage.setItem("crate-studio", PASSPHRASE);
      queueMicrotask(() => setOk(true));
      return;
    }
    if (localStorage.getItem("crate-studio") === PASSPHRASE) {
      queueMicrotask(() => setOk(true));
    }
  }, []);

  const [durMin, setDurMin] = useState(60);
  const [overlap, setOverlap] = useState(45);
  const [avgPlay, setAvgPlay] = useState(5);
  const [mode, setMode] = useState<Mode>("smooth");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState<string[]>([]);
  const [steps, setSteps] = useState<SetStep[]>([]);
  const [addPick, setAddPick] = useState("");

  const playable = useMemo(
    () => tracks.filter((t) => t.key_camelot && t.bpm).sort((a, b) => a.artist.localeCompare(b.artist)),
    [tracks],
  );
  const byId = useMemo(() => new Map(playable.map((t) => [tid(t), t])), [playable]);
  const plan = useMemo(() => planTrackCount(durMin, overlap, avgPlay), [durMin, overlap, avgPlay]);

  function generate(nextLocked = locked, nextExcluded = excluded) {
    const pool = playable.filter((t) => !nextExcluded.has(tid(t)));
    const lockedTracks = nextLocked.map((id) => byId.get(id)).filter(Boolean) as Track[];
    setSteps(generateSet(pool, { count: plan.tracks, mode, locked: lockedTracks }));
  }

  function toggleLock(t: Track) {
    const id = tid(t);
    const next = locked.includes(id) ? locked.filter((x) => x !== id) : [...locked, id];
    setLocked(next);
    generate(next, excluded);
  }
  function remove(t: Track) {
    const id = tid(t);
    const nextEx = new Set(excluded).add(id);
    const nextLocked = locked.filter((x) => x !== id);
    setExcluded(nextEx);
    setLocked(nextLocked);
    generate(nextLocked, nextEx);
  }
  function addSpecific() {
    if (!addPick || !byId.has(addPick)) return;
    const nextEx = new Set(excluded);
    nextEx.delete(addPick);
    const next = locked.includes(addPick) ? locked : [...locked, addPick];
    setExcluded(nextEx);
    setLocked(next);
    setAddPick("");
    generate(next, nextEx);
  }
  function copyList() {
    const text = steps.map((s, i) => `${i + 1}. ${s.track.artist} — ${s.track.title}${s.track.mix ? ` (${s.track.mix})` : ""}  [${s.track.key_camelot} · ${s.track.bpm}]`).join("\n");
    navigator.clipboard?.writeText(text);
  }

  const totalMin = steps.length ? Math.round(steps.length * avgPlay - (steps.length - 1) * (overlap / 60)) : 0;

  if (!ok) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateKick}>The Studio · private</p>
        <h1 className={styles.gateH}>Set builder</h1>
        <p className={styles.gateP}>Harmonic mix sequencing over the crate. Passphrase to enter.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pass.trim() === PASSPHRASE) {
              localStorage.setItem("crate-studio", PASSPHRASE);
              setOk(true);
            }
          }}
        >
          <input
            className={styles.gateInput}
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="passphrase"
            autoFocus
          />
          <button className={styles.gateBtn} type="submit">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <p className={styles.kick}>The Studio · private</p>
        <h1 className={styles.h1}>Set Builder</h1>
        <p className={styles.lede}>
          Sequenced past the Camelot wheel: fifths, the +2-semitone boost, mood flips, and the spicy
          non-Camelot moves scored for smoothness and tension. {playable.length} tracks in play.
        </p>
      </header>

      <section className={styles.controls}>
        <div className={styles.ctrl}>
          <label>Length</label>
          <div className={styles.segs}>
            {DURATIONS.map((d) => (
              <button
                key={d.min}
                className={durMin === d.min ? styles.segOn : styles.seg}
                onClick={() => setDurMin(d.min)}
              >
                {d.label}
              </button>
            ))}
            <input
              className={styles.num}
              type="number"
              min={10}
              max={360}
              value={durMin}
              onChange={(e) => setDurMin(Math.max(10, Number(e.target.value) || 60))}
              aria-label="custom minutes"
            />
            <span className={styles.unit}>min</span>
          </div>
        </div>

        <div className={styles.ctrlRow}>
          <div className={styles.ctrl}>
            <label>
              Crossfade overlap <b>{overlap}s</b>
            </label>
            <input type="range" min={30} max={60} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} />
          </div>
          <div className={styles.ctrl}>
            <label>
              Avg per track <b>{avgPlay} min</b>
            </label>
            <input type="range" min={3} max={7} step={0.5} value={avgPlay} onChange={(e) => setAvgPlay(Number(e.target.value))} />
          </div>
          <div className={styles.ctrl}>
            <label>Feel</label>
            <div className={styles.segs}>
              <button className={mode === "smooth" ? styles.segOn : styles.seg} onClick={() => setMode("smooth")}>
                Smooth
              </button>
              <button className={mode === "adventurous" ? styles.segOn : styles.seg} onClick={() => setMode("adventurous")}>
                Adventurous
              </button>
            </div>
          </div>
        </div>

        <div className={styles.planBar}>
          <span>
            ≈ <b>{plan.tracks}</b> tracks for {durMin} min
          </span>
          <button className={styles.go} onClick={() => generate()}>
            Generate set →
          </button>
        </div>
      </section>

      {steps.length > 0 && (
        <section className={styles.result}>
          <div className={styles.resultHead}>
            <span>
              {steps.length} tracks · ~{totalMin} min · {mode}
            </span>
            <button className={styles.copy} onClick={copyList}>
              Copy tracklist
            </button>
          </div>

          <ol className={styles.set}>
            {steps.map((s, i) => (
              <li key={tid(s.track)} className={styles.step}>
                {s.transition && (
                  <div className={styles.trans} style={{ ["--c" as string]: smoothColor(s.transition.smoothness) }}>
                    <span className={styles.transLabel}>{s.transition.label}</span>
                    <span className={styles.transMeta}>
                      {s.transition.semitones > 0 ? `+${s.transition.semitones}` : s.transition.semitones} st · smooth{" "}
                      {s.transition.smoothness} · tension {s.transition.tension}
                    </span>
                    <span className={styles.transNote}>{s.transition.note}</span>
                  </div>
                )}
                <div className={styles.row}>
                  <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.main}>
                    <div className={styles.name}>
                      <b>{s.track.artist}</b> — {s.track.title}
                      {s.track.mix && <i> ({s.track.mix})</i>}
                    </div>
                    <div className={styles.tags}>
                      <span className={styles.kc}>{s.track.key_camelot}</span>
                      <span>{s.track.bpm} BPM</span>
                      {s.track.role && <span>{s.track.role}</span>}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={locked.includes(tid(s.track)) ? styles.lockOn : styles.lock}
                      onClick={() => toggleLock(s.track)}
                      title="Lock this track in place"
                    >
                      {locked.includes(tid(s.track)) ? "● locked" : "○ lock"}
                    </button>
                    <button className={styles.kill} onClick={() => remove(s.track)} title="Remove from pool">
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.addBar}>
            <input
              list="crate-tracks"
              className={styles.addInput}
              value={addPick}
              onChange={(e) => setAddPick(e.target.value)}
              placeholder="add a specific track…"
            />
            <datalist id="crate-tracks">
              {playable.map((t) => (
                <option key={tid(t)} value={tid(t)}>
                  {t.artist} — {t.title} [{t.key_camelot}]
                </option>
              ))}
            </datalist>
            <button className={styles.add} onClick={addSpecific}>
              Add + lock
            </button>
            {excluded.size > 0 && (
              <button
                className={styles.reset}
                onClick={() => {
                  setExcluded(new Set());
                  setLocked([]);
                  generate([], new Set());
                }}
              >
                Reset removed ({excluded.size})
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
