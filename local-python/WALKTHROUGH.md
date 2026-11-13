# Written walkthrough draft

Review and update this before submitting. Do not claim verification you have not done.

## What works

A local browser interface lets members ask questions about BrightPath Learn.
It shows supporting document titles and expandable verbatim evidence. Unknown
questions say the information is unavailable and refer members to support.
A switch reproduces an API failure with a clear, recoverable error.
There is a real-model adapter for a local or hosted OpenAI-compatible endpoint.
It validates model-selected passage IDs before displaying any answer.

## Three saved test results

These results are from the labelled mock, not a real language model:

1. “When is group coaching?” → “A group coaching session takes place every
   Tuesday at 16:00 UTC.” Source: Document 2 — Coaching and feedback.
2. “What is the refund policy?” → Information is not available in the supplied
   documents; contact support@brightpath.example. No supporting citation claimed.
3. “When is group coaching?” with simulated API failure enabled → explicit
   simulated model API failure; no answer generated. At HTTP level this is 503.

All six automated tests passed. A local fake provider also verified the HTTP
adapter and rejection of invalid citations. No live model quality test or browser
interaction test was completed during generation.

## What I built / tools

ChatGPT/Codex generated the Python standard-library server, HTML/CSS/JavaScript
interface, model adapter, tests and documentation. No UI kit, framework or client
work was used. I must add what I personally reviewed, tested and changed here.

## What I would improve

Run a real-model evaluation with paraphrased, multi-part and adversarial questions.
Verbatim excerpts stop fabricated wording, but the model may select irrelevant
or incomplete evidence. Evaluate that before adding more features.

## Time spent

Add your honest total, including reviewing, running and modifying the generated
code. The assignment limits work to two hours.

## Submission

Upload the source to an accessible GitHub repository or a password-free download
service. This ChatGPT download is for the applicant; reviewer access is not
established. Hosting is optional. No test has been submitted automatically.
