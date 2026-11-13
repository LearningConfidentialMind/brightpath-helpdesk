const $ = id => document.getElementById(id);
function element(tag, text, parent) {
  const node = document.createElement(tag);
  node.textContent = text;
  parent.append(node);
  return node;
}
async function loadDocuments() {
  try {
    const response = await fetch('/api/documents');
    if (!response.ok) throw new Error('Documents unavailable');
    const documents = await response.json();
    for (const doc of documents) {
      const details = element('details', '', $('documents'));
      element('summary', `Document ${doc.id} — ${doc.title}`, details);
      element('p', doc.text, details);
    }
  } catch {
    element('p', 'Documents could not load. Please refresh the page.', $('documents'));
  }
}
loadDocuments();
for (const button of document.querySelectorAll('[data-q]')) {
  button.onclick = () => {
    $('question').value = button.dataset.q;
    $('question').focus();
  };
}
$('mode').onchange = () => {
  $('notice').textContent = $('mode').value === 'mock'
    ? 'Mock mode uses a small set of keyword rules. It does not demonstrate AI answer quality.'
    : 'Real-model mode requires a configured server model endpoint. This cloud demo has no model configured yet.';
};
$('form').onsubmit = async event => {
  event.preventDefault();
  $('ask').disabled = true;
  $('result').className = '';
  $('result').textContent = 'Checking the supplied documents…';
  $('sources').replaceChildren();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: $('question').value,
        mode: $('mode').value,
        simulate_failure: $('failure').checked
      }),
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The request failed. Please try again.');
    $('result').textContent = data.answer;
    for (const source of data.sources) {
      const details = element('details', '', $('sources'));
      element('summary', `Source: Document ${source.id} — ${source.title}`, details);
      for (const text of source.excerpts) element('p', text, details);
    }
  } catch (error) {
    $('result').className = 'error';
    $('result').textContent = error.name === 'AbortError'
      ? 'The request timed out. Please try again.'
      : error.message || 'Cannot reach the server. Please try again shortly.';
  } finally {
    clearTimeout(timer);
    $('ask').disabled = false;
  }
};
