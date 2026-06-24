"use client";

import dynamic from "next/dynamic";

// ssr:false must live in a client component. Poster shows until the canvas mounts.
const VinylHero = dynamic(() => import("./VinylHero").then((m) => m.VinylHero), {
  ssr: false,
  loading: () => (
    <div className="vh-poster" aria-hidden>
      <div className="vh-disc" />
    </div>
  ),
});

export default function HeroCanvas({ accent }: { accent?: string }) {
  return <VinylHero accent={accent} />;
}
