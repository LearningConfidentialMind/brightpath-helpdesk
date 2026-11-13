# BrightPath Learn help desk

[Live application](https://brightpath-helpdesk-jl.serihaldon.chatgpt.site/) · [Line-by-line code guide](https://brightpath-helpdesk-jl.serihaldon.chatgpt.site/code)

Public fictional help desk with an integrated, line-by-line code guide at `/code`.
The guide includes all hand-maintained runtime code, documents, automated checks,
build tools and hosting configuration. Each displayed source line has an authored
plain-English explanation. `source-notes.json` is annotation data, not another
program: its entries pair the exact source line with its explanation.

## Run locally

Requires Node.js 20+; no dependency installation is needed.

```
node scripts/build.mjs
node scripts/dev.mjs
```

Open http://127.0.0.1:3000 in your browser. Stop with Ctrl+C.

For the original Python version, see [local-python/README.md](local-python/README.md).

## Build and verify

Requires Node.js 20+; no dependencies or installation step.

```
node scripts/build.mjs
node scripts/validate-artifact.mjs
node --test test.mjs
```

The build fails if even one displayed source line differs from its actual file,
or any explanation is missing. When editing a source file, update its matching
entry in `source-notes.json`. The generated `dist/server/index.js` embeds the
verified sources, documents, and explanation catalog; it is a deployment copy,
not a separate hand-maintained implementation.

## Behavior and limitations

The default mock engine uses fixed keyword rules, not an AI model. Real-model
mode is present but needs MODEL_BASE_URL and MODEL_NAME, plus optional secret
MODEL_API_KEY, configured on the server. Keys never appear in the source guide.
No live language-model evaluation has been performed. A model can select
irrelevant real passages despite citation validation. Mock keyword rules can
also misinterpret questions. No answer quality is guaranteed by the source guide.
The earlier Python download is a separate local version, not the cloud runtime.

Generated with ChatGPT/Codex assistance. No client data is included.

## Repository contents

- `src/`: cloud server, HTML pages, CSS, browser JavaScript and fictional documents.
- `source-notes.json`: exact source lines with plain-English explanations.
- `scripts/`: build, deployment validation and local preview.
- `test.mjs`: cloud-app automated checks.
- `local-python/`: original Python application, tests, saved scenarios and setup instructions.

The live cloud app uses JavaScript, not Python. The two implementations are separate. Hosting remains on the existing Site; pushing to GitHub does not redeploy it.
