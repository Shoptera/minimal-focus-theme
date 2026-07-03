# Developer & editor workflow

How everyone — developers, admins, and non-technical editors — works on this theme
without stepping on each other.

## The one rule that makes everything work

> **Code lives in git. Content lives in Shopify.**

- **Code** = Liquid files, CSS, JS, locales, schema definitions. Changed only through git + pull requests.
- **Content** = what the theme editor edits: `config/settings_data.json`, `templates/**/*.json`, `sections/*.json` (text, images, section order, colors, banners…). Changed only in the Shopify theme editor.

Deploys to the production and sale themes **never push content files**, so nothing an
editor does in the admin is ever overwritten by a code deploy. And because we deploy
with the Shopify CLI from GitHub Actions (not the Shopify GitHub integration), there
are **no Shopify bot auto-commits** polluting the repo.

## The three branches / three themes

| Branch | Theme on store | Who touches it | How |
|---|---|---|---|
| `main` | **[CI] Production** | Developers via PR only | Merged PRs auto-deploy code |
| `dev` | **[CI] Development** | Developers, freely | Push to preview work on a real theme |
| `sale` | **[CI] Sale** | Nobody directly — synced from `main` | Code arrives automatically; sale content edited in the editor |

```
 feature/* ──PR──▶ main ──deploy──▶ [CI] Production   ◀── editors edit content here
                    │
                    └─auto sync (code only)──▶ sale ──deploy──▶ [CI] Sale   ◀── sale content edited here
 dev  ◀──push freely            (sale content always wins, never flows back)
  └────deploy──▶ [CI] Development
```

## Developer process

1. Branch from `main`: `git switch -c feature/my-change main`
2. Develop locally: `shopify theme dev` (uses your own CLI auth, renders against the store)
3. Want to show someone? Merge or push your work to `dev` — it auto-deploys to the
   **[CI] Development** theme; share its preview URL.
4. Open a PR to `main`. CI runs Theme Check; fix anything it flags.
5. Merge. Two things happen automatically:
   - `main` deploys to **[CI] Production** (code only, content untouched)
   - `main` is merged into `sale` (code only) and **[CI] Sale** redeploys —
     your new feature is on the sale theme without touching its sale content.

**Never** merge `sale` into `main` (CI blocks it). **Never** push a theme with
`--allow-live` from your machine — deploys are CI's job.

### Merge conflicts on the auto-sync

If `main → sale` hits a *code* conflict, the sync workflow opens a PR against `sale`
titled "Sync main into sale — manual conflict resolution needed". Resolve it like any
PR, with one rule: for content files, sale's version always wins.

## Admin editor / non-technical process

You only ever use the Shopify admin theme editor. No git, no GitHub.

- **Everyday content changes** (products pages, text, banners, settings):
  edit the **[CI] Production** theme in the editor. Your changes are live-safe —
  code deploys will never overwrite them.
- **Sale weekend content** (sale banners, promos, sale colors):
  edit the **[CI] Sale** theme in the editor, any time during the week.
  It always has the latest features from the developers, with your sale content intact.
- **Don't edit the [CI] Development theme** — developers overwrite it constantly.

### Weekend sale flow

1. During the week: prep sale content on the **[CI] Sale** theme in the editor.
2. Friday (or sale start): a store admin **publishes [CI] Sale** (Online Store → Themes → ⋯ → Publish).
3. Sale ends: publish **[CI] Production** again.

Publishing is always a deliberate human action — the pipeline never publishes themes.

> Note for admins: when a theme's role changes (published/unpublished), its theme ID
> stays the same, so the pipeline keeps working across sale weekends. If the currently
> published theme is the production theme, set the repo variable `PRODUCTION_IS_LIVE=true`
> so CI is allowed to push code to it.

## Getting editor content into git (optional but recommended)

Content edits live only in Shopify until captured. Periodically (e.g. after a big
content overhaul), run the **"Pull theme content (PR)"** workflow
(GitHub → Actions → Pull theme content → Run workflow):

- source `production` → opens a PR into `main` with the production theme's content
- source `sale` → opens a PR into `sale` (sale content never goes to main)
- source `dev` → opens a PR into `main`

Review and merge the PR. Now git has a versioned backup of the content.

## What can go wrong, and what happens instead

| Scenario | Outcome |
|---|---|
| Editor changes content while a deploy runs | Deploy ignores content files — nothing lost |
| Developer accidentally edits `settings_data.json` in a PR | Harmless: it's never pushed to production/sale themes (it does apply to the dev theme) |
| Someone opens a PR from `sale` to `main` | CI guard fails the PR |
| Code conflict on the main→sale sync | Sync opens a manual-resolution PR; nothing is guessed |
| A file is deleted from the repo | Deploys use `--nodelete`; delete it from the theme manually or with a deliberate `shopify theme push` without `--nodelete` |
