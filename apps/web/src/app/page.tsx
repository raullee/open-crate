import Link from "next/link";
import HeroCanvas from "./components/HeroCanvas";
import { getTracks, getStats, getKeyers, getRecentlyKeyed } from "@/lib/crate";
import { site } from "@/site.config";
import styles from "./home.module.css";

/** Deterministic ransom treatment (no hydration drift): rotation + style by index. */
function Ransom({ text }: { text: string }) {
  const rot = [-7, 5, -3, 6, -5, 3, -8, 4, -2, 7];
  const shift = ["0", "-0.04em", "0.05em", "0", "-0.05em", "0.03em", "0"];
  return (
    <span className={styles.ransom}>
      {[...text].map((ch, i) => {
        if (ch === " ") return <span key={i}>{" "}</span>;
        const cls = i % 7 === 3 ? styles.chipPink : i % 3 === 1 ? styles.chipInv : styles.chip;
        return (
          <span
            key={i}
            className={cls}
            style={{ "--rot": `${rot[i % rot.length]}deg`, "--shift": shift[i % shift.length] } as React.CSSProperties}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

function fmtDate(s?: string | null) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function Home() {
  const tracks = getTracks();
  const stats = getStats();
  const keyers = getKeyers();
  const recent = getRecentlyKeyed(7);
  const marquee = tracks.slice(0, 14).map((t) => `${t.artist} — ${t.title}`);

  return (
    <div className={styles.page}>
      {/* ---------- HERO ---------- */}
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroCanvasWrap}>
          <HeroCanvas accent={site.accent} />
        </div>

        <div className={styles.heroTop}>
          <span className={styles.kicker}>
            {site.name} · <b>The Crate</b>
          </span>
          <span className={styles.heroBadge}>
            <b>{stats.live}</b> records keyed
          </span>
        </div>

        <div className={styles.heroBody}>
          <h1 className={styles.heroHead}>
            <span className={styles.heroLine}>
              <Ransom text="THE" />
            </span>
            <span className={styles.heroLine}>
              <Ransom text="CRATE" />
            </span>
          </h1>
          <p className={styles.heroSub}>
            Hundreds of records, catalogued out loud by whoever comes round to dig through them.
          </p>
        </div>

        <span className={styles.heroCue}>
          <span aria-hidden /> scroll
        </span>
      </header>

      {/* ---------- PROGRESS / VITALS ---------- */}
      <section className={`${styles.section} ${styles.vitals}`}>
        <p className={styles.kicker}>
          The crate · <b>and counting</b>
        </p>
        <div className={styles.progressHead}>
          <div className={styles.bigNum}>
            <em>{stats.live}</em> records keyed
          </div>
          <p className={styles.progressNote}>
            Added to every time someone comes to dig. Check back; it grows.
          </p>
        </div>
        <div className={styles.statRow}>
          <div className={styles.stat}>
            <b>{stats.totalRead}</b>
            <span>read aloud</span>
          </div>
          <div className={styles.stat}>
            <b>{stats.keyed}</b>
            <span>key + BPM matched</span>
          </div>
          <div className={styles.stat}>
            <b>{stats.labels}</b>
            <span>labels</span>
          </div>
          {stats.yearSpan && (
            <div className={styles.stat}>
              <b>
                {stats.yearSpan[0]}–{stats.yearSpan[1]}
              </b>
              <span>pressings</span>
            </div>
          )}
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className={styles.marquee} aria-hidden>
        <div className={styles.marqueeTrack}>
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className={styles.section}>
        <p className={styles.kicker}>How the crate fills</p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>01</div>
            <h3 className={styles.stepH}>You come over and dig.</h3>
            <p className={styles.stepP}>
              The crates are open. Pull anything that catches your eye; that&apos;s the whole invitation.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>02</div>
            <h3 className={styles.stepH}>You read each one out loud.</h3>
            <p className={styles.stepP}>
              Artist and title, as you go. A voice note runs in the background. Set the ones you&apos;ve read to
              one side.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>03</div>
            <h3 className={styles.stepH}>AI files it properly.</h3>
            <p className={styles.stepP}>
              Your voice becomes a real catalogue: pressing, label, year, key and BPM. It lands here, searchable.
            </p>
          </div>
        </div>
        <p className={styles.rule}>
          One rule: <mark>don&apos;t key the same record twice</mark>. If you do, it gets filtered out anyway. The
          rule just keeps your head in the game.
        </p>
      </section>

      {/* ---------- THE IDEA ---------- */}
      <section className={`${styles.section} ${styles.why}`}>
        <p className={styles.kicker}>The idea</p>
        <p className={styles.whyText}>
          A record collection, twenty-odd years in the making. Rather than file it at a keyboard, the filing
          happens <b>out loud</b>. You dig through the crates, read what you pull, and the recording becomes the
          catalogue. The dull part turns social.
        </p>
      </section>

      {/* ---------- DIGGERS (leaderboard) ---------- */}
      <section className={styles.section}>
        <p className={styles.kicker}>The diggers</p>
        <div className={styles.board}>
          {keyers.map((k, i) => (
            <div key={k.name} className={styles.boardRow}>
              <div className={styles.rank}>{i + 1}</div>
              <div className={styles.who}>
                <div className={styles.badge} style={{ background: k.accent }}>
                  {k.short}
                </div>
                <div>
                  <div className={styles.whoName}>
                    {k.name}
                    {k.owner && <span className={styles.tag}>owner · retired</span>}
                  </div>
                  {k.note && <div className={styles.whoNote}>{k.note}</div>}
                </div>
              </div>
              <div className={styles.score}>
                <b>{k.recordsRead}</b>
                <span>read · {k.liveCount} live</span>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.boardAside}>
          Yes, I&apos;m losing to my own friend. That&apos;s the idea. The only way onto this board is to show up
          and dig.
        </p>
      </section>

      {/* ---------- LATEST ADDITIONS ---------- */}
      <section className={styles.section}>
        <p className={styles.kicker}>Latest into the crate</p>
        <div className={styles.feed}>
          {recent.map((t, i) => (
            <div key={i} className={styles.feedRow}>
              <div className={styles.feedMain}>
                <b>{t.artist}</b> <i>— {t.title}</i>
              </div>
              <div className={styles.feedMeta}>
                {t.key_camelot ? <em>{t.key_camelot}</em> : "—"} · {t.keyer ?? "—"} · {fmtDate(t.added_at)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- INVITE / FOMO ---------- */}
      <section className={`${styles.section} ${styles.invite}`}>
        <p className={styles.kicker}>Open to read · invite-only to dig</p>
        <h2 className={styles.inviteH}>Keyed by the friends who&apos;ve dug the crates.</h2>
        <p className={styles.inviteP}>
          Anyone can read what&apos;s in here. Adding to it happens in the room, over a recorder and a coffee. If
          you&apos;ve never been round to dig, that&apos;s the part you&apos;re missing.
        </p>
        <Link href="/crate" className={styles.cta}>
          Open the records →
        </Link>
        <span className={styles.ctaGhost}>Next time you&apos;re over, you&apos;re on recording duty</span>
      </section>

      <footer className={styles.foot}>
        <span>The Crate · {site.name}</span>
        <span>
          <Link href="/crate">the records</Link> · <Link href="/studio">studio</Link> ·{" "}
          <a href={site.repo} target="_blank" rel="noreferrer">built with open-crate ↗</a>
        </span>
      </footer>
    </div>
  );
}
