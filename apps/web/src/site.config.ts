/**
 * Brand it here. Everything user-facing that's specific to YOUR crate lives in
 * this one file, so you can fork open-crate and make it yours without hunting
 * through components. Page copy lives in the page components; the knobs are here.
 */
export const site = {
  /** Collection / brand name shown in the kicker, footer and metadata. */
  name: "Open Crate",
  /** Short tagline for OG/meta. */
  tagline: "Catalogue your records. Draft harmonic sets. Own your data.",
  /** Longer description for OG/meta. */
  description:
    "A free, open, local-first DJ crate: catalogue your records, enrich them with Camelot key + BPM, and draft harmonically-progressive sets. The engine is yours to extend.",
  /** Canonical URL of YOUR deployment (used for OG). Set after you deploy. */
  url: "https://open-crate.vercel.app",
  /** The upstream project, linked in the footer ("built with open-crate"). */
  repo: "https://github.com/raullee/open-crate",
  /** Design accent (fluoro pink by default). */
  accent: "#ff48b0",
  /**
   * Studio (set builder) gate. A light gate over public data, NOT security.
   * Override with NEXT_PUBLIC_STUDIO_PASS at build time. Empty string = no gate.
   */
  studioPass: process.env.NEXT_PUBLIC_STUDIO_PASS ?? "crate",
} as const;
