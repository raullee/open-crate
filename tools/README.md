# tools — getting your collection into the crate

The site reads one file: `apps/web/data/crate.json` (the [Open Crate Format](../docs/SCHEMA.md)). These scripts fill it. Build the engine first so the tools can use it:

```bash
corepack pnpm install
corepack pnpm build:core
```

## If you DJ digitally — import what you already have

Your library already knows the key and BPM, so this is instant and the set builder works straight away.

```bash
# Rekordbox: File > Export Collection in xml format, then:
node tools/import.mjs ~/rekordbox.xml --keyer "You"

# Anything else: export to CSV (needs at least artist,title columns) then:
node tools/import.mjs my-library.csv --keyer "You"
```

CSV headers are matched loosely (`artist`, `title`, `mix`, `bpm`, `key`/`camelot`, `year`, `label`, `catno`, `genre`, `tags`, …). A musical key like `Fm` or `F Minor` is converted to Camelot automatically.

## If you collect vinyl — the low-effort voice path

You don't type. You talk. This is the whole idea: cataloguing should be the fun part.

1. **Record yourself reading records aloud** — artist then title, one after another. A phone voice memo is fine.
2. **Transcribe it** with whatever you like (Whisper, MacWhisper, a Gemini/OpenAI transcription, even your phone's dictation). You want plain lines:
   ```
   Energy 52 - Café Del Mar
   Gouryella - Walhalla
   New Order - Blue Monday
   ```
   Save as `records.txt`. Don't fuss over spelling; the Discogs lookup self-corrects most mishearings.
3. **Enrich + file it:**
   ```bash
   export DISCOGS_USER_TOKEN=xxxx          # free: discogs.com/settings/developers
   export GETSONGBPM_API_KEY=xxxx          # optional, adds BPM + key
   node tools/enrich.mjs records.txt --keyer "You"
   ```

It looks up each record's pressing, label, year and catalogue number from Discogs, and (if you set the optional key) attaches BPM + Camelot key. Records with no key are still catalogued; they just won't appear in the set builder until keyed.

> Why this works: a track only enters the harmonic set builder if it has **both** a Camelot key and a BPM. Digital imports bring those for free. For vinyl, `GETSONGBPM_API_KEY` fills most of them; the rest you can type in `crate.json` or leave for later.

## Then run it

```bash
corepack pnpm dev      # http://localhost:3000
```

## Roll your own importer

Both scripts are ~150 lines and use [`@open-crate/core`](../packages/core) (the same engine the site runs on) for parsing, Camelot conversion and de-duplication. Copy one, point it at Serato / Traktor / Engine / a shop receipt, open a PR. See [the adapter interfaces](../packages/core/src/adapters/types.ts).
