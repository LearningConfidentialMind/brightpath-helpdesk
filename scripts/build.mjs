import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
const notes = JSON.parse(await readFile('source-notes.json', 'utf8'));
const text = {};
for (const file of notes.files) {
  text[file.path] = await readFile(file.path, 'utf8');
  const documented = file.lines.map(line => line.code).join('\n') + '\n';
  if (text[file.path] !== documented) throw new Error(`Update the line explanations for ${file.path}`);
  if (file.lines.some(line => !line.explanation?.trim())) throw new Error(`Missing explanation in ${file.path}`);
}
const assets = { text, documents: JSON.parse(text['src/documents.json']), catalog: notes };
const server = text['src/server.mjs'].replace('export function createHandler', 'function createHandler');
const bundle = `const assets = ${JSON.stringify(assets)};\n${server}\nexport default createHandler(assets);\n`;
await rm('dist', { recursive: true, force: true });
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await writeFile('dist/server/index.js', bundle);
await writeFile('dist/.openai/hosting.json', await readFile('.openai/hosting.json'));
console.log(`Built ${notes.files.length} explained files; every source line matches.`);
