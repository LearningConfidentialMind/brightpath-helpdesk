const $ = id => document.getElementById(id);
const codeOnly = document.body.dataset.view === 'source';
let files = [];
let activeFile;
function element(tag, text, parent, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  parent.append(node);
  return node;
}
function renderLines() {
  const query = $('line-search').value.trim().toLowerCase();
  $('code-rows').replaceChildren();
  let shown = 0;
  activeFile.lines.forEach((line, index) => {
    const searchable = codeOnly ? line.code : `${line.code} ${line.explanation}`;
    if (query && !searchable.toLowerCase().includes(query)) return;
    shown += 1;
    const row = element('div', '', $('code-rows'), 'line-row');
    row.id = `line-${index + 1}`;
    const number = element('a', String(index + 1), row, 'line-number');
    number.href = `?file=${encodeURIComponent(activeFile.path)}#line-${index + 1}`;
    number.setAttribute('aria-label', `Line ${index + 1}`);
    const code = element('pre', '', row, 'line-code');
    element('code', line.code || ' ', code);
    if (!codeOnly) element('p', line.explanation, row, 'line-explanation');
  });
  $('code-status').textContent = `${shown} of ${activeFile.lines.length} lines shown · ${activeFile.path}`;
  if (!shown) element('p', 'No matching lines. Try another word or clear the search.', $('code-rows'));
}
function selectFile(file, updateAddress = true) {
  activeFile = file;
  $('line-search').value = '';
  $('line-search').disabled = false;
  $('file-title').textContent = file.title;
  $('file-purpose').textContent = file.purpose;
  $('file-language').textContent = `${file.language} · ${file.path}`;
  $('download-file').href = `/api/source-file?file=${encodeURIComponent(file.path)}`;
  $('download-file').hidden = false;
  for (const button of $('file-list').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.path === file.path));
  }
  if (updateAddress) history.replaceState(null, '', `?file=${encodeURIComponent(file.path)}`);
  renderLines();
}
$('line-search').addEventListener('input', renderLines);
async function loadSource() {
  try {
    const response = await fetch('/api/source');
    if (!response.ok) throw new Error('Source unavailable');
    const catalog = await response.json();
    files = catalog.files;
    if (!files.length) throw new Error('Source unavailable');
    $('catalog-count').textContent = `${files.length} files · ${codeOnly ? 'source only' : 'every line explained'}`;
    for (const file of files) {
      const button = element('button', file.title, $('file-list'));
      button.type = 'button';
      button.dataset.path = file.path;
      element('small', file.path, button);
      button.onclick = () => selectFile(file);
    }
    const requested = new URLSearchParams(location.search).get('file');
    selectFile(files.find(file => file.path === requested) || files[0], false);
    if (/^#line-\d+$/.test(location.hash)) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
  } catch {
    $('file-title').textContent = 'The source files could not load';
    $('code-status').textContent = 'Please refresh the page to try again.';
    $('catalog-count').textContent = 'Files unavailable';
  }
}
loadSource();
