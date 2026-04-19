#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { getCommits } from './git.js';
import { fetchJiraIssues } from './jira.js';
import { generateStandup } from './claude.js';
import { postToSlack } from './slack.js';
import { loadConfig, runConfigWizard } from './config.js';
import { formatOutput } from './formatters.js';

const program = new Command();

program
  .name('standup')
  .description('Generate daily standup summaries from your git log using Claude AI')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a standup summary')
  .option('-s, --since <date>', 'Start date (default: last working day)', 'yesterday')
  .option('-u, --until <date>', 'End date (default: today)', 'today')
  .option('-r, --repo <path>', 'Repository path', process.cwd())
  .option('-j, --jira', 'Include Jira ticket details', false)
  .option('--slack', 'Post output to Slack', false)
  .option('-f, --format <type>', 'Output format: bullets, prose, slack', 'bullets')
  .option('-a, --author <email>', 'Git author email (overrides config)')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const author = options.author || config.git_author || await getDefaultAuthor();

      console.log(chalk.gray('Fetching git commits...'));
      const commits = await getCommits({
        since: options.since,
        until: options.until,
        repo: options.repo,
        author
      });

      if (commits.length === 0) {
        console.log(chalk.yellow('No commits found for the specified period.'));
        process.exit(0);
      }

      console.log(chalk.gray(`Found ${commits.length} commits`));

      let jiraIssues = [];
      if (options.jira) {
        console.log(chalk.gray('Fetching Jira issues...'));
        const ticketNumbers = extractTicketNumbers(commits);
        if (ticketNumbers.length > 0) {
          jiraIssues = await fetchJiraIssues(ticketNumbers, config);
          console.log(chalk.gray(`Found ${jiraIssues.length} Jira issues`));
        }
      }

      console.log(chalk.gray('Generating standup with Claude...'));
      const standup = await generateStandup({
        commits,
        jiraIssues,
        format: options.format,
        teamName: config.team_name
      });

      const output = formatOutput(standup, options.format);
      console.log('\n' + output);

      if (options.slack) {
        console.log(chalk.gray('\nPosting to Slack...'));
        await postToSlack(standup, config);
        console.log(chalk.green('Posted to Slack!'));
      }
    } catch (error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required.'));
        console.error(chalk.gray('Get your API key at https://console.anthropic.com'));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure standup-from-git interactively')
  .action(async () => {
    try {
      await runConfigWizard();
      console.log(chalk.green('\nConfiguration saved!'));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

async function getDefaultAuthor() {
  const { execSync } = await import('child_process');
  try {
    return execSync('git config user.email', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function extractTicketNumbers(commits) {
  const ticketPattern = /([A-Z]+-\d+)/g;
  const tickets = new Set();

  for (const commit of commits) {
    const matches = commit.message.match(ticketPattern);
    if (matches) {
      matches.forEach(ticket => tickets.add(ticket));
    }
  }

  return Array.from(tickets);
}

program.parse();
