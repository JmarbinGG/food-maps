export function reportError(err) {
  console.error('[Nouri]', err);
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

export function getExpirationStatus(date) {
  if (!date) return 'normal';
  const d = new Date(date);
  const hrs = (d - Date.now()) / 3600000;
  if (hrs < 0) return 'expired';
  if (hrs < 24) return 'critical';
  if (hrs < 72) return 'high';
  return 'normal';
}

export function safeDownload(filename, content, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
