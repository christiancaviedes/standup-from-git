# standup-from-git

[![npm version](https://img.shields.io/npm/v/standup-from-git.svg)](https://www.npmjs.com/package/standup-from-git)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

**Your standup writes itself. In 5 seconds.**

Stop scrambling every morning trying to remember what you did yesterday. `standup-from-git` reads your git history, optionally pulls in Jira context, and uses Claude AI to generate a clean, professional standup summary.

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Git Log   │ ──▶ │    Jira     │ ──▶ │  Claude AI  │ ──▶ │   Standup   │
│  (commits)  │     │  (optional) │     │  (summary)  │     │   Output    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. Pulls your git commits from the last working day
2. Extracts ticket numbers (PROJ-123) and fetches Jira context
3. Sends to Claude AI with a carefully tuned prompt
4. Outputs a clean standup ready to paste into Slack

## Installation

```bash
# Install globally
npm install -g standup-from-git

# Or run directly with npx
npx standup-from-git
```

## Quick Start

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Generate today's standup
standup generate

# That's it. Copy the output, paste into Slack.
```

## Usage Examples

### Basic (git only)

```bash
standup generate
```

### With Jira integration

```bash
standup generate --jira
```

### Custom date range

```bash
# Last 3 days
standup generate --since "3 days ago"

# Specific range
standup generate --since 2026-04-15 --until 2026-04-17
```

### Different output formats

```bash
# Bullet points (default)
standup generate --format bullets

# Prose style
standup generate --format prose

# Slack-formatted (with emoji)
standup generate --format slack
```

### Post directly to Slack

```bash
standup generate --slack
```

### Different repository

```bash
standup generate --repo ~/projects/my-other-repo
```

## Example Output

```
📋 Daily Standup — April 18, 2026

**Yesterday:**
• Implemented user authentication flow with JWT refresh tokens (AUTH-234)
• Fixed pagination bug in dashboard API that was causing duplicate entries (BUG-891)
• Reviewed and merged PR #142 for the new search feature

**Today:**
• Continue work on rate limiting middleware (AUTH-235)
• Write integration tests for the auth flow
• Team sync at 2pm to discuss Q2 roadmap

**Blockers:**
• None currently
```

## Configuration

### Interactive Setup

```bash
standup config
```

This launches an interactive wizard to configure:
- Git author email
- Jira credentials
- Slack webhook
- Default output format

### Config File

Configuration is stored in `~/.standup-from-git/config.json`:

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
| `JIRA_TOKEN` | Jira API token (if using --jira) |
| `SLACK_WEBHOOK_URL` | Slack webhook URL (if using --slack) |

## Requirements

- Node.js 18+
- Git
- Anthropic API key ([get one here](https://console.anthropic.com))

## Privacy

Your git commits are sent to the Claude API to generate summaries. No data is stored or logged by this tool. Review Anthropic's [privacy policy](https://www.anthropic.com/privacy) for API data handling.

## License

MIT © 2026 Christian Caviedes

## Contributing

Issues and PRs welcome at [github.com/christiancaviedes/standup-from-git](https://github.com/christiancaviedes/standup-from-git)
