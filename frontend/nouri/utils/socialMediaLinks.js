/**
 * Parse / serialize distribution-center social_media (JSON or legacy free text)
 * and build clickable icon link items for Nouri map popups.
 */

export const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', iconClass: 'fab fa-facebook', hosts: ['facebook.com', 'fb.com', 'fb.me'] },
  { key: 'instagram', label: 'Instagram', iconClass: 'fab fa-instagram', hosts: ['instagram.com', 'instagr.am'] },
  { key: 'twitter', label: 'X / Twitter', iconClass: 'fab fa-x-twitter', hosts: ['x.com', 'twitter.com', 't.co'] },
  { key: 'youtube', label: 'YouTube', iconClass: 'fab fa-youtube', hosts: ['youtube.com', 'youtu.be'] },
  { key: 'linkedin', label: 'LinkedIn', iconClass: 'fab fa-linkedin', hosts: ['linkedin.com'] },
  { key: 'tiktok', label: 'TikTok', iconClass: 'fab fa-tiktok', hosts: ['tiktok.com', 'vm.tiktok.com'] },
];

export function emptySocialMedia() {
  return {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    tiktok: '',
  };
}

export function normalizeExternalUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function hostMatches(hostname, hosts) {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function classifyUrl(url) {
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    for (const net of SOCIAL_NETWORKS) {
      if (hostMatches(parsed.hostname, net.hosts)) {
        return { key: net.key, url: normalized };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function extractUrls(text) {
  const out = [];
  const re = /https?:\/\/[^\s<>"')\]]+/gi;
  let match;
  while ((match = re.exec(String(text || ''))) !== null) {
    out.push(match[0].replace(/[.,;:!?)]+$/, ''));
  }
  const bare = /(?:^|\s)((?:facebook|fb|instagram|instagr\.am|x|twitter|youtube|youtu\.be|linkedin|tiktok|vm\.tiktok)\.[^\s<>"')\]]+)/gi;
  while ((match = bare.exec(String(text || ''))) !== null) {
    out.push(match[1].replace(/[.,;:!?)]+$/, ''));
  }
  return out;
}

export function parseSocialMedia(raw) {
  const result = emptySocialMedia();
  if (raw == null) return result;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    SOCIAL_NETWORKS.forEach((net) => {
      const v = raw[net.key];
      if (v) result[net.key] = String(v).trim();
    });
    return result;
  }
  const text = String(raw).trim();
  if (!text) return result;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      SOCIAL_NETWORKS.forEach((net) => {
        const v = parsed[net.key];
        if (v) result[net.key] = String(v).trim();
      });
      if (SOCIAL_NETWORKS.some((net) => result[net.key])) return result;
    }
  } catch {
    /* legacy free text */
  }

  extractUrls(text).forEach((url) => {
    const hit = classifyUrl(url);
    if (hit && !result[hit.key]) result[hit.key] = hit.url;
  });
  return result;
}

export function serializeSocialMedia(obj) {
  const src = obj && typeof obj === 'object' ? obj : {};
  const out = {};
  SOCIAL_NETWORKS.forEach((net) => {
    const v = src[net.key];
    if (v == null) return;
    const trimmed = String(v).trim();
    if (!trimmed) return;
    const normalized = normalizeExternalUrl(trimmed);
    if (normalized) out[net.key] = normalized;
  });
  if (!Object.keys(out).length) return '';
  return JSON.stringify(out);
}

export function socialLinkItems(center) {
  const items = [];
  if (!center || typeof center !== 'object') return items;
  const websiteUrl = normalizeExternalUrl(center.website);
  if (websiteUrl) {
    items.push({
      network: 'website',
      url: websiteUrl,
      iconClass: 'fas fa-globe',
      label: 'Website',
    });
  }
  const social = parseSocialMedia(center.social_media);
  SOCIAL_NETWORKS.forEach((net) => {
    const url = normalizeExternalUrl(social[net.key]);
    if (!url) return;
    items.push({
      network: net.key,
      url,
      iconClass: net.iconClass,
      label: net.label,
    });
  });
  return items;
}

export function renderSocialIconsHtml(center, opts = {}) {
  const items = socialLinkItems(center);
  if (!items.length) return '';
  const size = opts.size || '18px';
  const gap = opts.gap || '10px';
  const color = opts.color || '#15803d';
  const parts = items.map((item) => (
    `<a href="${String(item.url).replace(/"/g, '&quot;')}"`
    + ` target="_blank" rel="noopener noreferrer"`
    + ` aria-label="${String(item.label).replace(/"/g, '&quot;')}"`
    + ` title="${String(item.label).replace(/"/g, '&quot;')}"`
    + ` style="color:${color};font-size:${size};line-height:1;text-decoration:none;"`
    + `><i class="${item.iconClass}" aria-hidden="true"></i></a>`
  ));
  return (
    `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:${gap};">`
    + parts.join('')
    + '</div>'
  );
}

export default {
  SOCIAL_NETWORKS,
  emptySocialMedia,
  normalizeExternalUrl,
  parseSocialMedia,
  serializeSocialMedia,
  socialLinkItems,
  renderSocialIconsHtml,
};
