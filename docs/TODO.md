# TODO — tasks to pick up

Status as of 2026-07-03. The pipeline is fully built and the repo is live at
https://github.com/Shoptera/minimal-focus-theme (branches `main`/`dev`/`sale`,
all 7 workflows registered). Three themes exist on test-store8087.myshopify.com.
The items below need Aidan (permissions/decisions Claude couldn't take autonomously).

- [ ] **1. Unblock theme writes** — CI auth itself now works (Dev Dashboard app,
  client credentials; debug workflow reports AUTH VERIFIED, scopes
  `write_theme_code,write_themes`), but pushes fail with:
  `Access denied for themeFilesUpsert — needs write_themes AND an exemption from Shopify`.
  Per shopify.dev, ALL app tokens need this exemption to write theme files; only
  Theme Access passwords and interactive CLI logins are exempt. Two parallel paths:
  1. **Submit the exemption request** for the `theme-cicd` app (form linked from the
     error / shopify.dev "Asset API legacy" page — category: developer tooling,
     internal CI/CD for own org's stores). Review SLA ~2 weeks.
  2. **Bisect Theme Access:** on any OTHER store (or a fresh dev store created inside
     the Shoptera Dev Dashboard org), install Theme Access, make a password, and run
     `shopify theme list --store <other-store>.myshopify.com --password shptka_...`
     - Works there → Theme Access is broken on test-store8087 specifically: contact
       Shopify support, or move this example pipeline to the working store (swap the
       4 repo variables + create themes there — the setup is store-portable).
     - Fails there too → likely a new-gen dev-store limitation; rely on the exemption.
  Once either path works: run the debug workflow, then re-run "Deploy production"
  and "Sync main to sale". The content-safety test is already staged: the sale theme
  has a marker in `config/settings_data.json` and the sale branch has a pending code
  change — after the first successful sale deploy, verify the marker survived.
  Then delete `.github/workflows/debug-token.yml`.

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
