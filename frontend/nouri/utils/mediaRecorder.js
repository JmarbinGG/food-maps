export function createMediaRecorder(stream) {
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
  return mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
}
