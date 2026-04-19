# Contributing to standup-from-git

Thanks for wanting to help make standups even less painful. Contributions are welcome and appreciated.

## What We'd Love

- **New output formats** — Teams, Discord, Linear, other destinations
- **New integrations** — GitHub Issues, Linear, Shortcut as alternatives to Jira
- **Prompt improvements** — Better AI summarization for edge cases (large commit volumes, squash commits, etc.)
- **Bug reports** — Especially around git history parsing edge cases
- **Documentation fixes** — Typos, unclear instructions, missing examples

## How to Contribute

1. **Fork** the repo and create a branch: `git checkout -b feature/your-feature-name`
2. **Make your changes** — keep PRs focused on one thing
3. **Write a test** if you're adding behavior (see `tests/` for examples)
4. **Run the test suite**: `npm test`
5. **Open a PR** with a clear description of what you changed and why

## Code Style

- Use existing patterns in the codebase
- `npm run lint` before submitting
- No new dependencies without discussion in an issue first

## Reporting Issues

Open an issue with:
- Your OS and Node.js version
- The command you ran
- What you expected vs. what happened
- Any error output (with API keys removed)

## Questions

Open an issue with the `question` label. We're happy to help.
