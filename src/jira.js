import axios from 'axios';

export async function fetchJiraIssues(ticketNumbers, config) {
  if (!config.jira_url || !config.jira_email || !config.jira_token) {
    const token = process.env.JIRA_TOKEN;
    if (!token) {
      console.warn('Jira not configured. Run `standup config` to set up Jira integration.');
      return [];
    }
  }

  const jiraUrl = config.jira_url || process.env.JIRA_URL;
  const jiraEmail = config.jira_email || process.env.JIRA_EMAIL;
  const jiraToken = config.jira_token || process.env.JIRA_TOKEN;

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    return [];
  }

  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  const issues = [];

  for (const ticketNumber of ticketNumbers) {
    try {
      const response = await axios.get(
        `${jiraUrl}/rest/api/3/issue/${ticketNumber}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          timeout: 5000
        }
      );

      const issue = response.data;
      issues.push({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name || 'Unknown',
        type: issue.fields.issuetype?.name || 'Task',
        priority: issue.fields.priority?.name || 'Medium',
        assignee: issue.fields.assignee?.displayName || 'Unassigned'
      });
    } catch (error) {
      if (error.response?.status === 404) {
        continue;
      }
      if (error.response?.status === 401) {
        throw new Error('Jira authentication failed. Check your credentials.');
      }
    }
  }

  return issues;
}

export async function getAssignedIssues(config) {
  const jiraUrl = config.jira_url || process.env.JIRA_URL;
  const jiraEmail = config.jira_email || process.env.JIRA_EMAIL;
  const jiraToken = config.jira_token || process.env.JIRA_TOKEN;

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    return [];
  }

  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    const jql = encodeURIComponent(
      `assignee = currentUser() AND status NOT IN (Done, Closed) ORDER BY updated DESC`
    );

    const response = await axios.get(
      `${jiraUrl}/rest/api/3/search?jql=${jql}&maxResults=10`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.issues.map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name || 'Unknown',
      type: issue.fields.issuetype?.name || 'Task'
    }));
  } catch (error) {
    console.warn('Failed to fetch assigned Jira issues:', error.message);
    return [];
  }
}
