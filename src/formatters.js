import chalk from 'chalk';

export function formatOutput(standup, format) {
  switch (format) {
    case 'slack':
      return formatSlack(standup);
    case 'prose':
      return formatProse(standup);
    case 'bullets':
    default:
      return formatBullets(standup);
  }
}

function formatBullets(standup) {
  return standup
    .split('\n')
    .map(line => {
      if (line.startsWith('**') || line.startsWith('##')) {
        return chalk.bold.cyan(line.replace(/[*#]/g, '').trim());
      }
      if (line.startsWith('•') || line.startsWith('-')) {
        return chalk.white(line);
      }
      if (line.toLowerCase().includes('blocker')) {
        return chalk.yellow(line);
      }
      return line;
    })
    .join('\n');
}

function formatSlack(standup) {
  return standup
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/^## /gm, '*')
    .replace(/^- /gm, '• ');
}

function formatProse(standup) {
  return standup;
}

export function formatForClipboard(standup) {
  return standup
    .replace(/\*\*/g, '')
    .replace(/^## /gm, '')
    .trim();
}

export function formatPlainText(standup) {
  return standup
    .replace(/\*\*/g, '')
    .replace(/^## /gm, '')
    .replace(/[📋🔧✅❌🚧]/g, '')
    .trim();
}
