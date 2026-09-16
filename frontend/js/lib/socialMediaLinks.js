/**
 * Parse / serialize distribution-center social_media (JSON or legacy free text)
 * and build clickable icon link items for map / admin UIs.
 */
(function (global) {
  'use strict';

  var SOCIAL_NETWORKS = [
    { key: 'facebook', label: 'Facebook', iconClass: 'fab fa-facebook', hosts: ['facebook.com', 'fb.com', 'fb.me'] },
    { key: 'instagram', label: 'Instagram', iconClass: 'fab fa-instagram', hosts: ['instagram.com', 'instagr.am'] },
    { key: 'twitter', label: 'X / Twitter', iconClass: 'fab fa-x-twitter', hosts: ['x.com', 'twitter.com', 't.co'] },
    { key: 'youtube', label: 'YouTube', iconClass: 'fab fa-youtube', hosts: ['youtube.com', 'youtu.be'] },
    { key: 'linkedin', label: 'LinkedIn', iconClass: 'fab fa-linkedin', hosts: ['linkedin.com'] },
    { key: 'tiktok', label: 'TikTok', iconClass: 'fab fa-tiktok', hosts: ['tiktok.com', 'vm.tiktok.com'] },
  ];

  function emptySocialMedia() {
    return {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
      tiktok: '',
    };
  }

  function normalizeExternalUrl(url) {
    if (!url) return null;
    var trimmed = String(url).trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return 'https://' + trimmed;
  }

  function hostMatches(hostname, hosts) {
    var host = String(hostname || '').toLowerCase().replace(/^www\./, '');
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i];
      if (host === h || host.endsWith('.' + h)) return true;
    }
    return false;
  }

  function classifyUrl(url) {
    var normalized = normalizeExternalUrl(url);
    if (!normalized) return null;
    try {
      var parsed = new URL(normalized);
      for (var i = 0; i < SOCIAL_NETWORKS.length; i++) {
        var net = SOCIAL_NETWORKS[i];
        if (hostMatches(parsed.hostname, net.hosts)) {
          return { key: net.key, url: normalized };
        }
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function extractUrls(text) {
    var out = [];
    var re = /https?:\/\/[^\s<>"')\]]+/gi;
    var match;
    while ((match = re.exec(String(text || ''))) !== null) {
      out.push(match[0].replace(/[.,;:!?)]+$/, ''));
    }
    // Bare domains like facebook.com/page
    var bare = /(?:^|\s)((?:facebook|fb|instagram|instagr\.am|x|twitter|youtube|youtu\.be|linkedin|tiktok|vm\.tiktok)\.[^\s<>"')\]]+)/gi;
    while ((match = bare.exec(String(text || ''))) !== null) {
      out.push(match[1].replace(/[.,;:!?)]+$/, ''));
    }
    return out;
  }

  function parseSocialMedia(raw) {
    var result = emptySocialMedia();
    if (raw == null) return result;
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      SOCIAL_NETWORKS.forEach(function (net) {
        var v = raw[net.key];
        if (v) result[net.key] = String(v).trim();
      });
      return result;
    }
    var text = String(raw).trim();
    if (!text) return result;

    try {
      var parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        SOCIAL_NETWORKS.forEach(function (net) {
          var v = parsed[net.key];
          if (v) result[net.key] = String(v).trim();
        });
        // If JSON had only unknown keys, fall through to URL scrape of original text.
        var hasAny = SOCIAL_NETWORKS.some(function (net) { return result[net.key]; });
        if (hasAny) return result;
      }
    } catch (_) { /* legacy free text */ }

    extractUrls(text).forEach(function (url) {
      var hit = classifyUrl(url);
      if (hit && !result[hit.key]) result[hit.key] = hit.url;
    });
    return result;
  }

  function serializeSocialMedia(obj) {
    var src = obj && typeof obj === 'object' ? obj : {};
    var out = {};
    SOCIAL_NETWORKS.forEach(function (net) {
      var v = src[net.key];
      if (v == null) return;
      var trimmed = String(v).trim();
      if (!trimmed) return;
      var normalized = normalizeExternalUrl(trimmed);
      if (normalized) out[net.key] = normalized;
    });
    if (!Object.keys(out).length) return '';
    return JSON.stringify(out);
  }

  function socialLinkItems(center) {
    var items = [];
    if (!center || typeof center !== 'object') return items;
    var websiteUrl = normalizeExternalUrl(center.website);
    if (websiteUrl) {
      items.push({
        network: 'website',
        url: websiteUrl,
        iconClass: 'fas fa-globe',
        label: 'Website',
      });
    }
    var social = parseSocialMedia(center.social_media);
    SOCIAL_NETWORKS.forEach(function (net) {
      var url = normalizeExternalUrl(social[net.key]);
      if (!url) return;
      items.push({
        network: net.key,
        url: url,
        iconClass: net.iconClass,
        label: net.label,
      });
    });
    return items;
  }

  function renderSocialIconsHtml(center, opts) {
    opts = opts || {};
    var items = socialLinkItems(center);
    if (!items.length) return '';
    var size = opts.size || '18px';
    var gap = opts.gap || '10px';
    var color = opts.color || '#15803d';
    var parts = items.map(function (item) {
      return (
        '<a href="' + String(item.url).replace(/"/g, '&quot;') + '"' +
        ' target="_blank" rel="noopener noreferrer"' +
        ' aria-label="' + String(item.label).replace(/"/g, '&quot;') + '"' +
        ' title="' + String(item.label).replace(/"/g, '&quot;') + '"' +
        ' style="color:' + color + ';font-size:' + size + ';line-height:1;text-decoration:none;"' +
        '><i class="' + item.iconClass + '" aria-hidden="true"></i></a>'
      );
    });
    return (
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:' + gap + ';">' +
      parts.join('') +
      '</div>'
    );
  }

  var api = {
    SOCIAL_NETWORKS: SOCIAL_NETWORKS,
    emptySocialMedia: emptySocialMedia,
    normalizeExternalUrl: normalizeExternalUrl,
    parseSocialMedia: parseSocialMedia,
    serializeSocialMedia: serializeSocialMedia,
    socialLinkItems: socialLinkItems,
    renderSocialIconsHtml: renderSocialIconsHtml,
  };

  global.FoodMapsSocialMedia = api;
  global.parseSocialMedia = parseSocialMedia;
  global.serializeSocialMedia = serializeSocialMedia;
  global.socialLinkItems = socialLinkItems;
  global.normalizeSocialExternalUrl = normalizeExternalUrl;
})(typeof window !== 'undefined' ? window : globalThis);
