# Security Policy

## Supported versions

open-crate is pre-1.0. Security fixes land on `main` and the published `@open-crate/core` package.

| Version | Supported |
|---|---|
| latest `main` / `0.x` | ✅ |
| older | ❌ |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately via GitHub's [private vulnerability reporting](https://github.com/raullee/open-crate/security/advisories/new) (Security tab → Report a vulnerability). If that's unavailable, email the maintainer at the address on https://github.com/raullee.

You'll get an acknowledgement within 72 hours and a fix or mitigation timeline after triage. Please give us a reasonable window to patch before any public disclosure.

## Scope notes

open-crate is **static and local-first by design**: the reference app ships no server, no database, and no runtime secrets. The most likely surfaces are:

- The optional ingest tools (`tools/`), which read API tokens (Discogs, GetSongBPM) **from your environment** — never commit them; `.env*` is gitignored.
- Dependency vulnerabilities — reports welcome.

Thank you for helping keep open-crate and its users safe.
