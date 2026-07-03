# TODO — tasks to pick up

Status as of 2026-07-03. The pipeline is fully built and the repo is live at
https://github.com/Shoptera/minimal-focus-theme (branches `main`/`dev`/`sale`,
all 7 workflows registered). Three themes exist on test-store8087.myshopify.com.
The items below need Aidan (permissions/decisions Claude couldn't take autonomously).

- [x] **1. Create the CI deploy token** — done 2026-07-03; `SHOPIFY_CLI_THEME_TOKEN`
  secret is set and a Deploy dev run verified against it.

## Important — protection gaps

- [ ] **2. Allow Actions to open PRs** (~1 min). GitHub → repo → Settings → Actions →
  General → check **"Allow GitHub Actions to create and approve pull requests"**.
  Needed by the sync conflict-PR flow and the pull-content workflow.
  (Claude's permission classifier blocked setting this via API — flip it manually.)

- [ ] **3. Branch protection on `main`**. Both the protection API and rulesets returned
  `403: Upgrade to GitHub Pro or make this repository public` (free plan + private repo).
  Options:
  - Upgrade to GitHub Pro, then run the command in `docs/SETUP-NEW-STORE.md` §6, or
  - make the repo public (it's MIT-licensed skeleton code — but your call), or
  - accept the current soft protections (CI guard blocks sale→main PRs; nobody else
    has push access; the Shopify GitHub bot can't commit because the integration is
    never connected).

## Verify together when you're back

- [ ] **4. End-to-end content-safety test** (after #1):
  1. In the theme editor, change a heading on the **[CI] Sale** theme (190183407908)
  2. Merge any small PR to `main`
  3. Confirm: sale theme received the code change AND kept your heading.
- [ ] **5. Run "Pull theme content" once** (after #2) to see the content-capture PR flow.

## Decisions / nice-to-haves

- [ ] Decide the weekend sale publish cadence and who publishes (see docs/WORKFLOW.md,
  "Weekend sale flow"). Publishing is deliberately manual.
- [ ] Invite team collaborators to the repo; send editors the "Admin editor" section
  of docs/WORKFLOW.md.
- [ ] Optional: add a `schedule:` trigger to pull-content.yml (e.g. weekly Sunday
  night) so editor content is captured automatically as PRs.
- [ ] Optional: rename the repo if you want it clearly example-labelled
  (e.g. `shopify-theme-cicd-reference`).

## Notes

- Deploy-dev's first dispatch failed with "Secret SHOPIFY_CLI_THEME_TOKEN is required" —
  already fixed (secret now optional in deploy.yml; the guard step prints a friendly
  error instead). Expected to fail until #1 is done.
- The "Sync main to sale" workflow already ran green on the initial push.
