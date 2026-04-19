# standup-from-git

[![npm version](https://img.shields.io/npm/v/standup-from-git.svg)](https://www.npmjs.com/package/standup-from-git)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/christiancaviedes/standup-from-git/pulls)

## Your standup writes itself. In 5 seconds.

Every morning, engineers waste 5 minutes scrambling to remember what they did yesterday — context-switching right as they're trying to get into flow. `standup-from-git` reads your git history, optionally enriches it with Jira context, and uses Claude AI to write a clean, professional standup you can paste into Slack and move on.

No more "uhh I think I worked on auth stuff?" moments. Your commits tell the story — this tool just summarizes it.

---

## Features

- **Zero-config start** — works out of the box with just your Anthropic API key
- **Jira-aware** — auto-fetches ticket titles and summaries from commit references (PROJ-123)
- **Slack-ready output** — post directly to a channel via webhook
- **Multiple formats** — bullets, prose, or Slack-emoji style
- **Custom date ranges** — catch up on multi-day absences
- **Multi-repo support** — run across several repos at once
- **Configurable identity** — filter by git author email for shared machines
- **Fully local** — your commits never leave your machine except to the Claude API

---

## Install

```bash
# Install globally
npm install -g standup-from-git

# Or use without installing
npx standup-from-git
```

---

## Quick Start

```bash
# 1. Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# 2. Generate today's standup
standup generate

# 3. Copy. Paste. Done.
```

---

## Demo

```
$ standup generate

Fetching commits since Friday...
Found 6 commits across 2 branches.
Generating standup with Claude...

────────────────────────────────────────────
 Daily Standup — Monday, April 21, 2026
────────────────────────────────────────────

Yesterday:
• Implemented JWT refresh token rotation and added Redis session store (AUTH-234)
• Fixed pagination bug in /api/v2/dashboard — was returning duplicate records on
  page boundaries (BUG-891)
• Reviewed and merged PR #142: new full-text search feature from @sarahdev

Today:
• Wire up rate limiting middleware for auth endpoints (AUTH-235)
• Write integration tests for the token rotation flow
• Team sync at 2pm — Q2 roadmap discussion

Blockers:
• None

────────────────────────────────────────────
Copied to clipboard.
```

---

## Usage

```bash
# With Jira integration (fetches ticket details from commit refs)
standup generate --jira

# Custom date range
standup generate --since "3 days ago"
standup generate --since 2026-04-15 --until 2026-04-17

# Different output formats
standup generate --format bullets    # default
standup generate --format prose
standup generate --format slack      # includes emoji

# Post directly to Slack
standup generate --slack

# Different repo
standup generate --repo ~/projects/my-other-repo

# Interactive config setup
standup config
```

---

## Configuration

### Interactive Setup

```bash
standup config
```

### Config File (`~/.standup-from-git/config.json`)

```json
{
  "git_author": "you@company.com",
  "jira_url": "https://yourcompany.atlassian.net",
  "jira_email": "you@company.com",
  "jira_token": "your-jira-api-token",
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "default_format": "bullets",
  "working_hours": "9-17",
  "team_name": "Platform Team"
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | **Required.** Your Claude API key |
| `JIRA_TOKEN` | Jira API token (if using `--jira`) |
| `SLACK_WEBHOOK_URL` | Slack webhook (if using `--slack`) |

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   git log   │────▶│  Jira API   │────▶│  Claude AI  │────▶│   Standup   │
│  (commits)  │     │  (optional) │     │  (summary)  │     │   output    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. Reads your git commits from the last working day (skips weekends)
2. Extracts ticket numbers (e.g. `PROJ-123`) and fetches Jira title + status
3. Sends structured commit data to Claude with a carefully tuned prompt
4. Returns a clean standup formatted to your preference

---

## Requirements

- Node.js 18+
- Git
- [Anthropic API key](https://console.anthropic.com)

---

## Privacy

Your git commit messages are sent to the Anthropic API to generate summaries. No data is stored or logged by this tool. See Anthropic's [privacy policy](https://www.anthropic.com/privacy) for API data handling details.

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md). Issues and PRs are very welcome — especially new output formats, integrations, or AI prompt improvements.

---

## License

MIT © 2026 [Christian Caviedes](https://github.com/christiancaviedes)
