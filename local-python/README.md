# BrightPath Learn help desk

A small, local web application for Alessandro's AI developer practical test.
Uses only the three supplied fictional documents. No packages, accounts,
database or build step are required. Requires Python 3.10 or newer.

## Run on Windows

1. Extract this ZIP.
2. Open PowerShell in the extracted `brightpath` folder.
3. Run `py app.py` (or `python app.py`).
4. Open http://127.0.0.1:8000 in your browser.

On macOS/Linux: `python3 app.py`. Stop with Ctrl+C.
The server binds to localhost only; it is a local demo, not a production server.

## Modes

**Mock demo** is the default and is prominently labelled in the interface.
It uses deliberately narrow keyword rules and does not demonstrate model quality.
Unknown questions refer the member to support without inventing facts.

**Real language model** calls an OpenAI-compatible Chat Completions endpoint
from the Python server. Keys never enter the browser. No provider account or
paid API is required: a local Ollama installation can be used.

### Free local model with Ollama

Install Ollama from https://ollama.com, then run:

```
ollama pull llama3.2:3b
ollama serve
```

If Ollama is already running, a second `serve` process is unnecessary.
Start this app, choose **Real language model**, and ask a question.
Defaults: `http://127.0.0.1:11434/v1`, model `llama3.2:3b`.
Local models need sufficient RAM and a first model download. CPU inference
can exceed the 25-second request timeout on slower computers.

### Other OpenAI-compatible endpoint

Set these environment variables in the same shell before starting:

PowerShell:

```powershell
$env:MODEL_BASE_URL="https://YOUR-PROVIDER/v1"
$env:MODEL_NAME="YOUR-MODEL"
$env:MODEL_API_KEY="YOUR-KEY"
py app.py
```

Bash:

```bash
export MODEL_BASE_URL="https://YOUR-PROVIDER/v1"
export MODEL_NAME="YOUR-MODEL"
read -rs MODEL_API_KEY
export MODEL_API_KEY
python3 app.py
```

Replace the provider/model placeholders. The server appends `/chat/completions`.
Do not put keys in source, screenshots, submissions or version control.
The application does not load .env files. Use fictional questions only; in real
mode the question and all supplied documents go to the configured endpoint.

## How grounding works

All three short documents fit in context, so no vector database is needed.
Each original document line has a stable passage ID. The language model selects
passage IDs or declares the question unsupported. The server checks the schema
and citation IDs and renders the selected passages verbatim with document titles.
This extractive approach prevents new, invented answer wording, but does not prove
that the selected evidence is relevant or complete. A model can still pick the
wrong passage. No model failure is silently replaced with a mock answer.

## Failure test and API

Select **Simulate API failure**, then ask a question in either mode.
The server returns HTTP 503 with an explicit simulated-failure message.
Disable it to recover. Actual network errors, timeouts, malformed model output
and invalid citation IDs also produce a clear 503 response.

- `GET /api/documents`: source documents.
- `POST /api/ask`: JSON `{"question":"When is group coaching?","mode":"mock","simulate_failure":false}`.
- HTTP 400: invalid input; 503: model failure.

## Tests and saved evidence

Run `py -m unittest -v` on Windows, or `python3 -m unittest -v` elsewhere.
See `test-results.txt` and `scenarios.json` for the actual saved run.
Six tests cover supported/unknown questions, simulated failure, validation,
real HTTP transport against a local fake provider, invalid citations, unsupported
provider output, and an unavailable provider.

**No live language model was run during development.** The fake provider tests
exercise the adapter, not AI answer quality. Browser visual/interaction QA was
not performed. A live-model evaluation is still needed before submission if you
want to demonstrate AI answer quality. The assignment explicitly permits a
labelled mock when a model cannot be run.

## Scope and improvement

No sign-in, persistence, uploads, private/client data or external dependencies.
The first improvement would be an evaluated set of paraphrased and multi-part
questions against the actual local model, especially unsupported requests and
prompt-injection attempts. Then tune abstention and verify evidence relevance.
For production, add request/concurrency limits and a hardened web server.

## Authorship / AI disclosure

This package was generated with ChatGPT/Codex AI coding assistance, including
Python, UI, tests and documentation. It was not manually authored by the applicant.
The applicant should review, run and understand the implementation and describe
any personal modifications honestly. `WALKTHROUGH.md` contains a factual draft
that must be updated with the applicant's own verification and time spent.
