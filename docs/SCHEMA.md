# The Open Crate Format (OCF)

A tiny, portable shape for a DJ/record collection. The goal is unglamorous but important: if enough tools read and write this, your library stops being hostage to any one app. It's plain JSON — committable, diffable, exportable, yours.

`apps/web/data/crate.json` is an OCF document. The TypeScript source of truth is [`packages/core/src/schema/types.ts`](../packages/core/src/schema/types.ts).

## Document

```jsonc
{
  "ocf": "1.0.0",                      // format version (semver; match the major to read safely)
  "meta": { "name": "My Crate", "owner": "you", "target": 300 },
  "keyers": [ /* Keyer[] — optional, powers the leaderboard */ ],
  "tracks": [ /* Track[] */ ]
}
```

## Track

Only `artist` and `title` are required. Everything else is optional, so a crate of half-known vinyl is still valid; tools enrich progressively.

| field | type | notes |
|---|---|---|
| `artist` *(req)* | string | |
| `title` *(req)* | string | |
| `mix` | string | remix / version, distinct from title |
| `year` `label` `catno` `country` `genre` `style` | | release metadata; `catno` is the reliable vinyl identity |
| `bpm` | number | |
| `key_musical` | string | e.g. `"F Minor"` |
| `key_camelot` | string | e.g. `"4A"` — the field the harmonic engine uses |
| `energy` | 1–5 | always user-overridable |
| `source` | `"vinyl" \| "digital" \| "stream"` | |
| `location` | string | file path/URI for digital |
| `discogs_url` `release_id` | | canonical references |
| `tags` | string[] | one track can live in many buckets |
| `added_at` | ISO date | drives the "latest" feed |
| `keyer` | string | who catalogued it (credit + leaderboard) |
| `analysis_confidence` | 0–1 | so UIs can flag low-trust analysis |
| `ext` | object | tool-specific data without breaking the schema |

## Rules

- **Identity / dedupe:** case- and space-insensitive `(artist, title, mix)` (`trackId()`).
- **Set eligibility:** a track enters the harmonic set builder only if it has **both** `key_camelot` and `bpm`.
- **Versioning:** additions stay optional; bump `OCF_VERSION` major on any breaking change.

A published JSON-Schema for non-TS validators is on the [roadmap](./ROADMAP.md).
