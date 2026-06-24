import Link from "next/link";
import { getTracks } from "@/lib/crate";
import { site } from "@/site.config";
import { Crate } from "../components/Crate";
import styles from "../crate.module.css";

export const metadata = {
  title: "The Crate · the records",
  description: "Search the collection. Sort by BPM, key, year. Tap a key to find what mixes with it.",
};

export default function CratePage() {
  const tracks = getTracks();
  const withKey = tracks.filter((t) => t.key_camelot).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.eyebrow}>
          ← {site.name} · The Crate
        </Link>
        <h1 className={styles.title}>
          The <em>records</em>
        </h1>
        <p className={styles.lede}>Everything keyed so far. Tap a key chip to surface harmonic matches.</p>
        <p className={styles.count}>
          <span>{tracks.length} records</span>
          <span className={styles.dotsep}>{withKey} key-matched</span>
        </p>
      </header>

      <Crate tracks={tracks} />

      <footer className={styles.footer}>
        Keys in Camelot notation; tap a key to surface harmonic matches. Enrich your own crate with the tools in the repo.
        <br />
        <Link href="/">← back to the story</Link>
      </footer>
    </main>
  );
}
