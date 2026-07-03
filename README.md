# Minimal Focus Theme — Shopify CI/CD pipeline

A [Shopify Skeleton theme](https://github.com/Shopify/skeleton-theme) wired to a
production-grade, replicable CI/CD pipeline: three git branches, three themes, one-way
content-safe syncing, and a workflow that lets developers and non-technical admin
editors work simultaneously without conflicts.

**Store:** `test-store8087.myshopify.com`

## How it works

```
 feature/* ──PR + Theme Check──▶ main ──▶ deploy ──▶ [CI] Production theme  ◀── admins edit content
                                  │                       (content JSON never pushed)
                                  └──▶ auto-sync (code only) ──▶ sale ──▶ deploy ──▶ [CI] Sale theme  ◀── sale content
 dev ◀── push freely ──▶ deploy ──▶ [CI] Development theme                    (content JSON never pushed)
```

- **Code lives in git, content lives in Shopify.** Deploys to the production and sale
  themes ignore content JSON (`config/settings_data.json`, `templates/**/*.json`,
  `sections/*.json`), so theme-editor changes are never overwritten.
- **One-way sync:** every merge to `main` flows code into `sale` automatically; sale
  content always wins and never flows back. CI blocks `sale → main` PRs.
- **No Shopify GitHub-integration bot.** Deploys use the Shopify CLI in GitHub Actions
  with a Theme Access token — no bot auto-commits, and `main` is PR-only.
- **Publishing is human.** The pipeline never publishes a theme; sale weekends are a
  manual publish/unpublish swap in the admin.

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | every PR | Theme Check + blocks `sale → main` merges |
| `deploy-production.yml` | push to `main` | Deploys code to [CI] Production |
| `deploy-dev.yml` | push to `dev` | Full deploy (incl. content) to [CI] Development |
| `deploy-sale.yml` | push to `sale` | Deploys code to [CI] Sale |
| `sync-main-to-sale.yml` | push to `main` | Merges main→sale (sale content wins), deploys sale |
| `pull-content.yml` | manual | Captures theme-editor content into a reviewed PR |
| `deploy.yml` | called by the above | Reusable push-to-theme logic |

## Docs

- **[docs/WORKFLOW.md](./docs/WORKFLOW.md)** — day-to-day process for developers and admin editors
- **[docs/SETUP-NEW-STORE.md](./docs/SETUP-NEW-STORE.md)** — replicate this pipeline on any other store
- **[docs/TODO.md](./docs/TODO.md)** — open setup tasks
- **[AGENTS.md](./AGENTS.md)** — Liquid/theme coding standards (also used by AI agents)

## Local development

```bash
shopify theme dev        # live-preview against the store
shopify theme check      # lint before pushing
```

Theme architecture follows the standard Shopify layout (`assets/`, `blocks/`,
`config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) — see
[Shopify's theme architecture docs](https://shopify.dev/docs/storefronts/themes/architecture).

## License

Theme is based on Shopify's Skeleton Theme, open-sourced under the [MIT](./LICENSE.md) license.
