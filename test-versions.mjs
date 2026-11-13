import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './src/server.mjs';
const worker = createHandler({ documents: [], text: {}, catalog: { files: [] } });
const request = () => worker.fetch(new Request('https://example.test/api/versions'), {});
test('versions preserve real commit timestamps and repository links', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async address => {
    assert.match(String(address), /LearningConfidentialMind\/brightpath-helpdesk\/commits\?sha=main/);
    return Response.json([{ sha: 'a'.repeat(40), commit: { message: 'Test change\nExtra detail', committer: { date: '2026-11-13T17:16:00Z' } } }]);
  };
  try {
    const response = await request();
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.versions[0].date, '2026-11-13T17:16:00Z');
    assert.equal(data.versions[0].title, 'Test change');
    assert.equal(data.versions[0].url, 'https://github.com/LearningConfidentialMind/brightpath-helpdesk/commit/' + 'a'.repeat(40));
  } finally { globalThis.fetch = originalFetch; }
});
test('unavailable GitHub returns a clear error', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  try {
    const response = await request();
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /GitHub history could not be loaded/);
  } finally { globalThis.fetch = originalFetch; }
});
