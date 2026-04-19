import axios from 'axios';

export async function postToSlack(standup, config) {
  const webhookUrl = config.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Slack webhook URL not configured. Run `standup config` or set SLACK_WEBHOOK_URL.');
  }

  const slackMessage = formatForSlack(standup);

  try {
    await axios.post(webhookUrl, slackMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  } catch (error) {
    if (error.response) {
      throw new Error(`Slack API error: ${error.response.status} - ${error.response.data}`);
    }
    throw new Error(`Failed to post to Slack: ${error.message}`);
  }
}

function formatForSlack(standup) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: standup
      }
    }
  ];

  return {
    blocks,
    text: standup.substring(0, 100) + '...'
  };
}

export function convertToSlackFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/^• /gm, '• ')
    .replace(/^- /gm, '• ');
}
