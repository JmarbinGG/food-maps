/**
 * Shrink a phone photo before upload: vision + storage only need ~1600px,
 * and a 12MP original can be 5–8MB on a slow mobile connection.
 *
 * Always resolves. Returns the original file when it is already small, not a
 * raster image the browser can decode, or when anything goes wrong.
 */
const MAX_EDGE = 1600;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 400 * 1024;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image decode failed')); };
    img.src = url;
  });
}

export async function compressImage(file, { maxEdge = MAX_EDGE, quality = QUALITY } = {}) {
  try {
    if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type || '')) return file;
    if (file.size <= SKIP_BELOW_BYTES) return file;

    const img = await loadImage(file);
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export default compressImage;
