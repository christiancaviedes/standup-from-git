import { execSync } from 'child_process';

export async function getCommits({ since, until, repo, author }) {
  const sinceDate = parseDate(since);
  const untilDate = parseDate(until);

  const authorArg = author ? `--author="${author}"` : '';
  const sinceArg = `--since="${sinceDate}"`;
  const untilArg = `--until="${untilDate} 23:59:59"`;

  const format = '--pretty=format:%H|%s|%b|%ai';

  const cmd = `git log ${authorArg} ${sinceArg} ${untilArg} ${format}`;

  try {
    const output = execSync(cmd, {
      cwd: repo,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });

    if (!output.trim()) {
      return [];
    }

    return parseGitLog(output);
  } catch (error) {
    if (error.message.includes('not a git repository')) {
      throw new Error(`Not a git repository: ${repo}`);
    }
    throw error;
  }
}

function parseGitLog(output) {
  const commits = [];
  const entries = output.split('\n').filter(line => line.includes('|'));

  for (const entry of entries) {
    const [hash, subject, body, date] = entry.split('|');

    if (!hash || !subject) continue;

    commits.push({
      hash: hash.trim(),
      message: subject.trim(),
      body: body ? body.trim() : '',
      date: new Date(date.trim()),
      ticketNumbers: extractTickets(subject + ' ' + (body || ''))
    });
  }

  return commits;
}

function extractTickets(text) {
  const pattern = /([A-Z]+-\d+)/g;
  const matches = text.match(pattern);
  return matches ? [...new Set(matches)] : [];
}

function parseDate(input) {
  if (!input) return new Date().toISOString().split('T')[0];

  const today = new Date();
  const normalized = input.toLowerCase().trim();

  if (normalized === 'today') {
    return today.toISOString().split('T')[0];
  }

  if (normalized === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  const daysAgoMatch = normalized.match(/(\d+)\s*days?\s*ago/);
  if (daysAgoMatch) {
    const daysAgo = parseInt(daysAgoMatch[1], 10);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  const weeksAgoMatch = normalized.match(/(\d+)\s*weeks?\s*ago/);
  if (weeksAgoMatch) {
    const weeksAgo = parseInt(weeksAgoMatch[1], 10);
    const date = new Date(today);
    date.setDate(date.getDate() - (weeksAgo * 7));
    return date.toISOString().split('T')[0];
  }

  if (normalized === 'last working day' || normalized === 'last workday') {
    const date = new Date(today);
    do {
      date.setDate(date.getDate() - 1);
    } while (date.getDay() === 0 || date.getDay() === 6);
    return date.toISOString().split('T')[0];
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  throw new Error(`Unable to parse date: ${input}`);
}

export function groupCommitsByDate(commits) {
  const grouped = {};

  for (const commit of commits) {
    const dateKey = commit.date.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(commit);
  }

  return grouped;
}
