import assert from 'node:assert/strict';
import test from 'node:test';

import { extractTickets, groupCommitsByDate, parseDate, parseGitLog } from '../src/git.js';

test('extractTickets deduplicates Jira-style issue keys', () => {
  assert.deepEqual(extractTickets('Ship ABC-12, fix ABC-12 and OPS-7'), ['ABC-12', 'OPS-7']);
});

test('parseDate handles relative and explicit dates deterministically', () => {
  const now = new Date('2026-08-08T12:00:00Z');
  assert.equal(parseDate('today', now), '2026-08-08');
  assert.equal(parseDate('yesterday', now), '2026-08-07');
  assert.equal(parseDate('3 days ago', now), '2026-08-05');
  assert.equal(parseDate('2026-07-31', now), '2026-07-31');
});

test('parseGitLog builds structured commits', () => {
  const commits = parseGitLog('abc123|Ship login flow|Closes AUTH-9|2026-08-07 10:30:00 +0000');
  assert.equal(commits.length, 1);
  assert.equal(commits[0].hash, 'abc123');
  assert.equal(commits[0].message, 'Ship login flow');
  assert.deepEqual(commits[0].ticketNumbers, ['AUTH-9']);
});

test('groupCommitsByDate groups ISO dates', () => {
  const grouped = groupCommitsByDate([
    { date: new Date('2026-08-07T10:00:00Z') },
    { date: new Date('2026-08-07T11:00:00Z') },
    { date: new Date('2026-08-08T09:00:00Z') }
  ]);
  assert.equal(grouped['2026-08-07'].length, 2);
  assert.equal(grouped['2026-08-08'].length, 1);
});
