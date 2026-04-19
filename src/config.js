import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';

const CONFIG_DIR = join(homedir(), '.standup-from-git');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  git_author: '',
  jira_url: '',
  jira_email: '',
  jira_token: '',
  slack_webhook_url: '',
  default_format: 'bullets',
  working_hours: '9-17',
  team_name: ''
};

export async function loadConfig() {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return DEFAULT_CONFIG;
    }

    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error.message);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function runConfigWizard() {
  const currentConfig = await loadConfig();

  console.log('\n📋 standup-from-git Configuration\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'git_author',
      message: 'Git author email:',
      default: currentConfig.git_author || await getGitEmail()
    },
    {
      type: 'input',
      name: 'jira_url',
      message: 'Jira URL (e.g., https://company.atlassian.net):',
      default: currentConfig.jira_url
    },
    {
      type: 'input',
      name: 'jira_email',
      message: 'Jira email:',
      default: currentConfig.jira_email,
      when: (answers) => answers.jira_url
    },
    {
      type: 'password',
      name: 'jira_token',
      message: 'Jira API token:',
      default: currentConfig.jira_token ? '********' : '',
      when: (answers) => answers.jira_url,
      transformer: (input) => input ? '********' : ''
    },
    {
      type: 'input',
      name: 'slack_webhook_url',
      message: 'Slack webhook URL (optional):',
      default: currentConfig.slack_webhook_url
    },
    {
      type: 'list',
      name: 'default_format',
      message: 'Default output format:',
      choices: ['bullets', 'prose', 'slack'],
      default: currentConfig.default_format
    },
    {
      type: 'input',
      name: 'team_name',
      message: 'Team name (optional):',
      default: currentConfig.team_name
    }
  ]);

  if (answers.jira_token === '********') {
    answers.jira_token = currentConfig.jira_token;
  }

  const newConfig = { ...currentConfig, ...answers };
  await saveConfig(newConfig);

  return newConfig;
}

async function getGitEmail() {
  const { execSync } = await import('child_process');
  try {
    return execSync('git config user.email', { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}
