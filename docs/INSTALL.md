# Install open-crate — pick your friction level

From zero-effort to full control. Most people want #1 or #2.

## 0. Just look at it (no install)
Live demo: **https://open-crate.vercel.app** — that's open-crate running.

## 1. One-click deploy (no terminal)
Click the **Deploy** button in the [README](../README.md). Vercel forks the repo and deploys your own crate with the sample records and the default skin. Then edit `apps/web/data/crate.json` to make it yours.

## 2. Paste-in-your-AI-terminal (the frictionless one)
Have a coding agent (Claude Code, Cursor, Copilot CLI, Gemini CLI)? Paste the prompt in [`LLM-INSTALL-PROMPT.txt`](../LLM-INSTALL-PROMPT.txt) and it clones, installs, and runs open-crate for you, defaulting to the default skin. Then it offers to import your library.

## 3. One-liner (degit)
```bash
npx degit raullee/open-crate my-crate && cd my-crate && corepack enable && pnpm install && pnpm build:core && pnpm dev
```
Opens at http://localhost:3000 with sample records.

## 4. Full clone (to contribute)
```bash
git clone https://github.com/raullee/open-crate && cd open-crate
corepack enable && pnpm install && pnpm build:core && pnpm dev
```

## Make it yours
- **Your records:** see [`tools/`](../tools/README.md) — import a Rekordbox/CSV export, or voice-note your vinyl.
- **Your brand + skin:** `apps/web/src/site.config.ts` (name, accent, studio passphrase).

Requirements: Node 20+. pnpm comes free via `corepack` (bundled with Node) — no global install.
