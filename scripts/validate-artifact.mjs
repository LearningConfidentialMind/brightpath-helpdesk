import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile('dist/server/index.js', 'utf8');
JSON.parse(await readFile('dist/.openai/hosting.json', 'utf8'));
const address = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const worker = await import(address);
assert.equal(typeof worker.default?.fetch, 'function');
console.log('Artifact is valid ESM and exports default.fetch');
