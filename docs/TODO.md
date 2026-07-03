# TODO — tasks to pick up

Status as of 2026-07-03. The pipeline is fully built and the repo is live at
https://github.com/Shoptera/minimal-focus-theme (branches `main`/`dev`/`sale`,
all 7 workflows registered). Three themes exist on test-store8087.myshopify.com.
The items below need Aidan (permissions/decisions Claude couldn't take autonomously).

- [ ] **1. Finish CI auth (Dev Dashboard app)** — Theme Access is broken on this
  store: even freshly generated `shptka_` passwords get 401 locally and from
  Shopify's own auth proxy (verified 2026-07-03 via the debug workflow), so we
  switched to a Dev Dashboard app using the client credentials grant. Aidan created
  the app, installed it, granted theme scopes. Remaining:
  1. `gh secret set SHOPIFY_CLIENT_ID --repo Shoptera/minimal-focus-theme`
  2. `gh secret set SHOPIFY_CLIENT_SECRET --repo Shoptera/minimal-focus-theme`
  3. Confirm the app and test-store8087 are in the SAME Dev Dashboard org
     (store listed under the org's "Dev stores"), else `shop_not_permitted`.
  4. Run the "Debug Shopify auth (temporary)" workflow → expect "AUTH VERIFIED".
  5. Delete the stale secret: `gh secret delete SHOPIFY_CLI_THEME_TOKEN --repo Shoptera/minimal-focus-theme`
  6. Delete `.github/workflows/debug-token.yml` once green.

## Important — protection gaps

- [x] **2. Allow Actions to open PRs** — done 2026-07-03. Note for org-owned repos:
  this must be enabled at BOTH the org level (Org Settings → Actions → General, which
  merely unlocks the repo checkbox) and the repo level. Default workflow permissions
  stay at `read` — workflows request `contents: write` explicitly where needed.

- [x] **3. Branch protection on `main`** — done 2026-07-03 after the repo went public:
  PRs required (with `theme-check` status check), force pushes and deletion blocked.
  Admins can still push directly (`enforce_admins: false`) so pipeline maintenance
  doesn't need PRs; flip that on later if more people get admin.
  Also applied for public hardening: fork-PR workflows require approval for all
  outside collaborators; secret scanning + push protection enabled.

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
