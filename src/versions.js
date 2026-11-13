const versionStatus = document.getElementById('version-status');
const versionList = document.getElementById('version-list');
const refreshVersions = document.getElementById('refresh-versions');
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium', timeStyle: 'long', timeZone: 'Europe/Helsinki'
});
async function loadVersions() {
  refreshVersions.disabled = true;
  versionStatus.textContent = 'Checking GitHub history…';
  try {
    const response = await fetch('/api/versions', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'GitHub history is unavailable.');
    versionList.replaceChildren();
    for (const version of data.versions) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = version.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${version.sha.slice(0, 7)} · ${version.title}`;
      const time = document.createElement('time');
      time.dateTime = version.date;
      time.textContent = dateFormat.format(new Date(version.date));
      time.title = `UTC: ${version.date}`;
      item.append(link, time);
      versionList.append(item);
    }
    versionStatus.textContent = data.versions.length
      ? `Latest ${data.versions.length} commits · checked ${dateFormat.format(new Date(data.checkedAt))}`
      : 'This repository does not have any commits yet.';
  } catch (error) {
    versionStatus.textContent = `${error.message} Use the full history link below, or try Refresh versions.`;
  } finally {
    refreshVersions.disabled = false;
  }
}
refreshVersions.addEventListener('click', loadVersions);
loadVersions();
