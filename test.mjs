import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile('dist/server/index.js', 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const get = path => worker.fetch(new Request('https://example.test' + path), {});
const ask = data => worker.fetch(new Request('https://example.test/api/ask', {
  method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }
}), {});
test('supported answer cites document 2', async () => {
  const response = await ask({ question: 'When is group coaching?' });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.match(data.answer, /Tuesday at 16:00 UTC/);
  assert.equal(data.sources[0].id, 2);
});
test('unknown policy abstains', async () => {
  const data = await (await ask({ question: 'What is the refund policy?' })).json();
  assert.equal(data.supported, false);
  assert.deepEqual(data.sources, []);
});
test('simulated failure returns 503', async () => {
  assert.equal((await ask({ question: 'When is coaching?', simulate_failure: true })).status, 503);
});
test('unconfigured model is explicit', async () => {
  const response = await ask({ question: 'When is coaching?', mode: 'model' });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/);
});
test('invalid input is rejected', async () => {
  assert.equal((await ask({ question: '' })).status, 400);
});
test('pages and source documents load', async () => {
  assert.equal((await (await get('/api/documents')).json()).length, 3);
  assert.match(await (await get('/')).text(), /Code explained/);
  assert.match(await (await get('/code')).text(), /The code, in plain English/);
});
test('every explanation matches the real source', async () => {
  const catalog = await (await get('/api/source')).json();
  assert.ok(catalog.files.some(file => file.path === 'src/explainer.js'));
  for (const file of catalog.files) {
    const actual = await readFile(file.path, 'utf8');
    assert.equal(file.lines.map(line => line.code).join('\n') + '\n', actual);
    assert.ok(file.lines.every(line => line.explanation.trim().length > 10));
    const download = await get('/api/source-file?file=' + encodeURIComponent(file.path));
    assert.equal(await download.text(), actual);
  }
});
test('source download cannot read arbitrary paths', async () => {
  assert.equal((await get('/api/source-file?file=../../secret')).status, 404);
});
