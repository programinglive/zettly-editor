# Contributing to Zettly Editor

Thanks for your interest in contributing! We welcome pull requests and issues that help improve the project.

## Development Workflow

1. Fork the repository and clone your fork locally.
2. Install dependencies with `npm install`.
3. Run `npm run example:dev` to work on the playground locally.
4. Write tests with `vitest` and run `npm run test`.
5. Build the package with `npm run build`.

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via Husky and Commitlint.
Create commits using standard git commands:

```bash
git add .
git commit -m "feat(editor): add bubble toolbar"
```

Common commit types:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code restructuring
- `test:` Test additions or updates
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Pull Requests

- Keep PRs focused on a single change.
- Ensure `npm run test` and `npm run build` both succeed.
- Update documentation (`README.md`) and examples when behavior changes.
- Fill out the pull request template with context and test results.

## Code Style

- TypeScript should avoid `any`. Prefer precise types.
- Remove unused imports and console logs before submitting.
- Follow the existing ESLint and Prettier configuration.

## Reporting Issues

Use GitHub Issues to report bugs or request features. Please include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Relevant screenshots or logs

## Security Issues

Please report security vulnerabilities privately. See `SECURITY.md` for contact details.
