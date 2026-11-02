# Publishing `@programinglive/zettly-editor`

Publishing uses **npm trusted publishing (OIDC)**. There is no `NPM_TOKEN` secret and nothing to rotate.

## Setup (already configured)

At https://www.npmjs.com/package/@programinglive/zettly-editor/access → Trusted Publisher:

| Field | Value |
|---|---|
| Publisher | GitHub Actions |
| Organization | `programinglive` |
| Repository | `zettly-editor` |
| Workflow filename | `publish.yml` |
| Allowed actions | npm publish, npm stage publish, npm dist-tag |

## Why there is no token

The workflow requests a GitHub OIDC token (`permissions: id-token: write`) and npm exchanges it for a short-lived credential scoped to that single workflow run. Nothing long-lived is stored in the repository.

That is also why `setup-node` for npmjs.com does **not** set `registry-url`: doing so writes an `_authToken` placeholder into `.npmrc` and the OIDC exchange is skipped.

## Requirements

- `npm >= 11.5.1` — the workflow uses Node 24, which bundles it.
- The workflow file must be named exactly `publish.yml` and live in `.github/workflows/`.
- Manual runs must use the repository default branch, or a tag/release event.

## Publishing

```bash
# via tag
git tag v0.2.18 && git push origin v0.2.18

# or manually
gh workflow run publish.yml --repo programinglive/zettly-editor
```

Versions already on npm are skipped, so re-running is safe.

## First-run validation

A trusted publisher stays in **Pending validation** until it has completed one successful publish. npm showed a deadline of 4 Nov 2026 06:02 UTC for this package; if it lapses, recreate the trusted publisher and publish again.

## GitHub Packages

The second half of the workflow still publishes to `npm.pkg.github.com` using the built-in `GITHUB_TOKEN`. That needs no secret.

## If it fails

| Error | Cause |
|---|---|
| `ENEEDAUTH` | OIDC exchange did not happen: check `id-token: write`, that no `NODE_AUTH_TOKEN` is set for the npm step, and that `setup-node` has no `registry-url` for npmjs.com |
| `403 ... not authorized` | The trusted publisher entry does not match owner/repo/workflow exactly |
| `E422` version exists | Expected; the step skips already-published versions |
