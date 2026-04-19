import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generateStandup({ commits, jiraIssues, format, teamName }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const systemPrompt = `You are a helpful assistant that generates professional daily standup summaries for software engineers.

Your task is to take git commit messages and optional Jira ticket context, then produce a clear, concise standup update.

Guidelines:
- Group related commits into coherent work items
- Use professional but conversational tone
- Be specific about what was accomplished
- Keep bullet points concise (one line each)
- If ticket numbers are present, include them in parentheses
- For "Today" section, infer logical next steps from yesterday's work
- Only mention blockers if there's evidence of one (failed tests, dependency issues, etc.)
- Never make up work that isn't evidenced by the commits
- Format the date nicely at the top

${format === 'slack' ? 'Use Slack-friendly formatting with emoji.' : ''}
${format === 'prose' ? 'Write in paragraph form instead of bullets.' : ''}
${teamName ? `This is for the ${teamName} team.` : ''}`;

  const commitSummary = commits.map(c => {
    const tickets = c.ticketNumbers.length > 0 ? ` [${c.ticketNumbers.join(', ')}]` : '';
    return `- ${c.message}${tickets}`;
  }).join('\n');

  const jiraSummary = jiraIssues.length > 0
    ? '\n\nJira Context:\n' + jiraIssues.map(j =>
        `- ${j.key}: ${j.summary} (${j.status})`
      ).join('\n')
    : '';

  const userPrompt = `Generate a standup summary for ${today}.

Git commits from yesterday:
${commitSummary}
${jiraSummary}

Please generate a standup with:
1. What I did yesterday (based on the commits)
2. What I'm doing today (infer from context)
3. Blockers (if any evidence of blockers, otherwise "None")`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });

  return message.content[0].text;
}
