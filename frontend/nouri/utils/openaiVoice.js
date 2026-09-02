function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

export async function transcribeAudio(blob) {
  const token = getToken();
  const fd = new FormData();
  fd.append('audio', blob, 'voice.webm');
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (data.filtered) return '';
  return data.transcript || '';
}
