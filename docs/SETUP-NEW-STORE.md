# Replicating this pipeline on another store

Checklist to stand up the same 3-branch / 3-theme pipeline for any store you work on.
Time: ~30 minutes.

> **Keep client-store repos private.** The pull-content workflow commits store content
> (copy, campaign names, theme settings) into git, and the repo reveals the store URL.
> This reference repo is public because it's MIT skeleton code against a test store —
> that also unlocks free branch protection. For private client repos, branch protection
> requires GitHub Pro/Team. If a repo is public: require approval for all outside
> collaborators' fork-PR workflows and enable secret scanning + push protection
> (Settings → Actions / Security), as done on this repo.

## Prerequisites

- Admin (or collaborator with theme permissions) access to the Shopify store
- A GitHub account/org for the repo, `gh` CLI authenticated
- Shopify CLI installed and authenticated locally (`shopify theme list` works)

## 1. Create the repo

```bash
# From a copy of the store's current theme code (shopify theme pull from the live theme
# into an empty folder), or use this repo as a template:
gh repo create <owner>/<store>-theme --private --source . --push
```

Copy from this repo: `.github/workflows/`, `docs/`, `.claude/`, `CLAUDE.md`,
`.gitignore`, `.theme-check.yml`.

## 2. Create the branches

```bash
git branch dev main && git branch sale main
git push origin dev sale
```

## 3. Create the three themes on the store

From the theme directory (with local CLI auth against the target store):

```bash
shopify theme push --unpublished --theme "[CI] Production (main)" --json
shopify theme push --unpublished --theme "[CI] Development (dev)" --json
shopify theme push --unpublished --theme "[CI] Sale (sale)" --json
```

Note the `id` in each JSON response.

**Existing live theme instead?** Skip creating a production theme and use the live
theme's ID as `PRODUCTION_THEME_ID`, then set `PRODUCTION_IS_LIVE=true` in step 5.

## 4. Create the CI deploy token (Theme Access app)

1. In the store admin, install the free **Theme Access** app (by Shopify).
2. Create a password for a CI "user" (use a real email; the password arrives by email/link).
3. Save it as a repo secret:

```bash
gh secret set SHOPIFY_CLI_THEME_TOKEN --repo <owner>/<repo>
# paste the shptka_... password
```

This token only grants theme permissions — safer than a personal CLI session in CI.

## 5. Set the repo variables

```bash
gh variable set SHOPIFY_STORE          --repo <owner>/<repo> --body "<store>.myshopify.com"
gh variable set PRODUCTION_THEME_ID    --repo <owner>/<repo> --body "<id from step 3>"
gh variable set DEV_THEME_ID           --repo <owner>/<repo> --body "<id>"
gh variable set SALE_THEME_ID          --repo <owner>/<repo> --body "<id>"
# Only if PRODUCTION_THEME_ID is the store's published theme:
gh variable set PRODUCTION_IS_LIVE     --repo <owner>/<repo> --body "true"
```

## 6. Protect main

Requires GitHub Pro/Team for **private** repos (free for public ones).

```bash
gh api -X PUT repos/<owner>/<repo>/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": { "strict": false, "contexts": ["theme-check"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

Or in the UI: Settings → Branches → Add rule for `main`: require a pull request,
require the `theme-check` status check, block force pushes.

This also blocks any bot (including Shopify's GitHub integration bot, if a teammate
connects it by mistake) from committing directly to `main`.

> **Important:** never connect the Shopify GitHub integration ("Add theme from GitHub")
> to this repo's branches. This pipeline replaces it; connecting both causes duplicate
> syncs and bot commits.

## 7. Verify

1. Push a trivial change to `dev` → Actions runs "Deploy dev" → change appears on the
   [CI] Development theme preview.
2. Open + merge a PR to `main` → "Deploy production (main)" and "Sync main to sale"
   both run → change appears on production AND sale themes.
3. In the theme editor, change a heading on the [CI] Sale theme, then merge another PR
   to `main` → confirm the sale theme got the code change and kept the heading.

## 8. Onboard the team

- Developers: read `docs/WORKFLOW.md`, clone, `shopify theme dev`.
- Admin editors: only need to know which theme to edit ([CI] Production for live
  content, [CI] Sale for sale content) — send them the "Admin editor" section of
  `docs/WORKFLOW.md`.

## Store-specific values for THIS repo (test-store8087)

| Setting | Value |
|---|---|
| Store | `test-store8087.myshopify.com` |
| PRODUCTION_THEME_ID | `190183342372` |
| DEV_THEME_ID | `190183375140` |
| SALE_THEME_ID | `190183407908` |
| PRODUCTION_IS_LIVE | unset (production stand-in theme is unpublished) |
