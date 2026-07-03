# Minimal Focus Theme — CI/CD pipeline

Shopify Skeleton theme wired to a 3-branch CI/CD pipeline on `test-store8087.myshopify.com`.
This repo is also the reference implementation for replicating the setup on other stores.

## Branch ↔ theme map

| Branch | Theme (ID) | Deploys | Content JSON |
|---|---|---|---|
| `main` (protected) | [CI] Production (190183342372) | on push, via Actions | never pushed — admin editors own it |
| `dev` | [CI] Development (190183375140) | on push | pushed (mirrors repo) |
| `sale` | [CI] Sale (190183407908) | on push + after sync | never pushed — sale content lives in editor |

"Content JSON" = `config/settings_data.json`, `templates/**/*.json`, `sections/*.json`.

## Hard rules

1. **Never** `shopify theme publish`, `theme delete`, or push with `--live`/`--allow-live`. Deploys happen only through GitHub Actions. (Enforced by `.claude/hooks/guard-bash.js`.)
2. **One-way sync:** `main → sale` only. Never merge `sale` into `main` or any other branch. Sale content stays on the sale theme/branch.
3. Content JSON belongs to the theme editor. Don't hand-edit it to change store content; capture editor changes with the "Pull theme content" workflow instead.
4. Work only inside this directory. Temporary files go in the scratchpad, not the repo.
5. `main` is PR-only. Feature branches (`feature/*`) branch from `main`; preview by pushing/merging to `dev`.

## Where things are

- `.github/workflows/` — deploy (reusable), per-branch deploys, main→sale sync, CI, content pull
- `docs/WORKFLOW.md` — day-to-day process (developers + admin editors)
- `docs/SETUP-NEW-STORE.md` — replicate this pipeline on another store
- `docs/TODO.md` — open tasks to pick up
- `AGENTS.md` — Liquid/theme coding standards. Read it before writing Liquid; validate theme code with the Shopify MCP `validate_theme` tool.
