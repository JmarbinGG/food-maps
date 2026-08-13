/**
 * Shared admin page editor for Food Maps marketing/content pages.
 *
 * Editing UX matches Admin → Distribution Centers: a form panel with fields,
 * live preview on the page, Save / Cancel. No blue dashed borders on the page.
 *
 * Usage:
 *   <script src="utils/pageEditor.js"></script>
 *   <script>window.FoodMapsPageEditor.init({ pageId: 'landing', fullPage: true });</script>
 */
(function (global) {
  'use strict';

  const STYLE_ID = 'fm-page-editor-styles';
  const TEXT_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BLOCKQUOTE', 'LI', 'FIGCAPTION', 'DT', 'DD']);
  const DEFAULT_EXCLUDE = [
    'nav',
    'script',
    'style',
    'svg',
    'noscript',
    'button',
    'input',
    'textarea',
    'select',
    'option',
    'form',
    'label',
    'footer a',
    'footer button',
    '[data-no-edit]',
    '[data-language-picker]',
    '.fm-edit-toolbar',
    '.edit-toolbar',
    '#adminEditBtn',
    '#editToolbar',
    '#fm-page-editor-panel',
    '#slideshow-admin-modal',
    '#slideshow-admin-btn',
    '#mobile-menu-btn',
    '#impact-pounds-value',
    '#impact-families-value',
    '.icon-menu',
    '[class*="icon-"]',
  ];

  let state = null;

  function getAuthToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  }

  function cssEscape(value) {
    if (global.CSS && typeof global.CSS.escape === 'function') return global.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .fm-admin-edit-btn {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1200;
        width: 56px;
        height: 56px;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        color: #fff;
        background: #15803d;
        box-shadow: 0 10px 30px rgba(21, 128, 61, 0.45);
        display: none;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .fm-admin-edit-btn:hover {
        transform: scale(1.06);
        background: #166534;
      }
      .fm-admin-edit-btn.is-editing {
        background: #b91c1c;
      }
      /* Disable legacy dashed-border edit styling from older page CSS */
      .edit-mode .editable,
      .edit-mode .editable:hover,
      .edit-mode .editable-img,
      .edit-mode .editable-img:hover,
      .edit-mode .editable-bg,
      .edit-mode .editable-bg:hover {
        outline: none !important;
        border-style: none !important;
        cursor: inherit !important;
        background: inherit;
      }
      .fm-page-editor-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: min(440px, 100vw);
        height: 100vh;
        z-index: 1190;
        background: #fff;
        border-left: 1px solid #e5e7eb;
        box-shadow: -12px 0 40px rgba(0,0,0,0.12);
        display: none;
        flex-direction: column;
      }
      body.edit-mode .fm-page-editor-panel { display: flex; }
      body.edit-mode { padding-right: min(440px, 100vw); }
      @media (max-width: 720px) {
        body.edit-mode { padding-right: 0; }
      }
      .fm-page-editor-panel__header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }
      .fm-page-editor-panel__header h3 {
        margin: 0 0 0.25rem;
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
      }
      .fm-page-editor-panel__header p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
      .fm-page-editor-panel__body {
        flex: 1;
        overflow: auto;
        padding: 1rem 1.25rem 1.5rem;
      }
      .fm-page-editor-field {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f3f4f6;
      }
      .fm-page-editor-field label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #374151;
        margin-bottom: 0.4rem;
      }
      .fm-page-editor-field .fm-field-hint {
        font-size: 0.7rem;
        color: #9ca3af;
        margin: -0.2rem 0 0.4rem;
        text-transform: none;
        letter-spacing: 0;
        font-weight: 500;
      }
      .fm-page-editor-field input,
      .fm-page-editor-field textarea {
        width: 100%;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        padding: 0.6rem 0.75rem;
        font-size: 0.9375rem;
        color: #111827;
        background: #fff;
        box-sizing: border-box;
      }
      .fm-page-editor-field input:focus,
      .fm-page-editor-field textarea:focus {
        outline: none;
        border-color: #15803d;
        box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
      }
      .fm-page-editor-field textarea {
        min-height: 88px;
        resize: vertical;
        line-height: 1.45;
      }
      .fm-page-editor-panel__footer {
        padding: 0.9rem 1.25rem;
        border-top: 1px solid #e5e7eb;
        background: #fff;
        display: flex;
        gap: 0.6rem;
      }
      .fm-page-editor-panel__footer button {
        flex: 1;
        border: none;
        border-radius: 0.5rem;
        padding: 0.7rem 0.75rem;
        font-weight: 650;
        cursor: pointer;
      }
      .fm-page-editor-panel__footer .fm-save {
        background: #15803d;
        color: #fff;
      }
      .fm-page-editor-panel__footer .fm-save:hover { background: #166534; }
      .fm-page-editor-panel__footer .fm-cancel {
        background: #e5e7eb;
        color: #374151;
      }
      .fm-page-editor-panel__footer .fm-cancel:hover { background: #d1d5db; }
      .fm-page-editor-status {
        font-size: 0.75rem;
        color: #6b7280;
        padding: 0 1.25rem 0.75rem;
        min-height: 1rem;
      }
      .fm-field-focus {
        transition: box-shadow 0.2s ease;
        box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.35) !important;
        border-radius: 4px;
      }
      /* Hide tiny legacy toolbar if still in markup */
      .edit-mode .edit-toolbar:not(.fm-page-editor-panel),
      #editToolbar:not(.fm-page-editor-panel) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function humanizeKey(key) {
    return String(key || '')
      .replace(/^(img_|bg_)/, '')
      .replace(/^partner-/, 'Partner · ')
      .replace(/^benefit-/, 'Benefit · ')
      .replace(/^path-|^txt-|^id-/, '')
      .replace(/[-_/]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || 'Field';
  }

  function plainTextFromHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || '').replace(/\u00a0/g, ' ').trim();
  }

  function ensureChrome() {
    let btn = document.getElementById('adminEditBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'adminEditBtn';
      btn.className = 'fm-admin-edit-btn admin-edit-btn';
      btn.title = 'Edit page content';
      btn.type = 'button';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>`;
      document.body.appendChild(btn);
    } else {
      btn.classList.add('fm-admin-edit-btn');
      btn.title = 'Edit page content';
    }
    btn.style.display = 'none';
    btn.onclick = () => toggleEditMode();

    let panel = document.getElementById('fm-page-editor-panel');
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'fm-page-editor-panel';
      panel.className = 'fm-page-editor-panel';
      panel.setAttribute('aria-label', 'Page content editor');
      panel.innerHTML = `
        <div class="fm-page-editor-panel__header">
          <h3>Edit Page Content</h3>
          <p>Update fields below. Changes preview live on the page.</p>
        </div>
        <div class="fm-page-editor-panel__body" data-fm-fields></div>
        <div class="fm-page-editor-status" data-fm-status></div>
        <div class="fm-page-editor-panel__footer">
          <button type="button" class="fm-cancel" data-fm-cancel>Cancel</button>
          <button type="button" class="fm-save" data-fm-save>Save Changes</button>
        </div>`;
      document.body.appendChild(panel);
    }
    panel.querySelector('[data-fm-save]').onclick = () => saveChanges();
    panel.querySelector('[data-fm-cancel]').onclick = () => cancelEdit();

    // Hide leftover tiny toolbar from older markup
    const legacy = document.getElementById('editToolbar');
    if (legacy && legacy.id !== 'fm-page-editor-panel') {
      legacy.style.display = 'none';
    }

    return { btn, panel };
  }

  function setStatus(message) {
    const el = document.querySelector('#fm-page-editor-panel [data-fm-status]');
    if (el) el.textContent = message || '';
  }

  function matchesAny(el, selectors) {
    for (let i = 0; i < selectors.length; i++) {
      try {
        if (el.matches(selectors[i]) || el.closest(selectors[i])) return true;
      } catch (_) { /* ignore */ }
    }
    return false;
  }

  function buildPathKey(el, prefix) {
    const parts = [];
    let node = el;
    let guard = 0;
    while (node && node !== document.body && guard < 30) {
      guard += 1;
      const parent = node.parentElement;
      if (!parent) break;
      const tag = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(tag + '#' + node.id);
        break;
      }
      const siblings = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
      const idx = Math.max(0, siblings.indexOf(node));
      parts.unshift(tag + idx);
      node = parent;
    }
    return (prefix || 'path') + '-' + parts.join('/');
  }

  function isExcluded(el, excludeSelectors) {
    if (!el || el.nodeType !== 1) return true;
    return matchesAny(el, excludeSelectors);
  }

  function hasEditableAncestor(el) {
    let node = el.parentElement;
    while (node) {
      if (node.hasAttribute && node.hasAttribute('data-editable')) return true;
      node = node.parentElement;
    }
    return false;
  }

  function meaningfulText(el) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length >= 2 ? text : '';
  }

  function autoMarkFullPage(options) {
    const excludeSelectors = DEFAULT_EXCLUDE.concat((options && options.excludeSelectors) || []);
    const root = (options && options.root && document.querySelector(options.root)) || document.body;
    if (!root) return { text: 0, images: 0 };

    let textCount = 0;
    let imageCount = 0;
    const candidates = root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,blockquote,li,figcaption,dt,dd,span,div,img');
    candidates.forEach((el) => {
      if (isExcluded(el, excludeSelectors)) return;
      if (el.hasAttribute('data-editable') || el.hasAttribute('data-editable-img') || el.hasAttribute('data-editable-bg')) {
        return;
      }

      if (el.tagName === 'IMG') {
        const w = el.naturalWidth || el.width || 0;
        const h = el.naturalHeight || el.height || 0;
        if ((w && w < 40) || (h && h < 40)) return;
        if (el.closest('nav, button, a.transition-transform')) return;
        el.setAttribute('data-editable-img', buildPathKey(el, 'img'));
        imageCount += 1;
        return;
      }

      if (!TEXT_TAGS.has(el.tagName)) {
        if (el.tagName !== 'SPAN' && el.tagName !== 'DIV') return;
        if (el.children && el.children.length > 0) {
          const hasBlockChild = Array.from(el.children).some(
            (c) => TEXT_TAGS.has(c.tagName) || c.tagName === 'DIV' || c.tagName === 'A' || c.tagName === 'BUTTON'
          );
          if (hasBlockChild) return;
        }
        if (el.tagName === 'DIV' && (!el.className || String(el.className).includes('flex') || String(el.className).includes('grid'))) {
          if ((el.children && el.children.length > 2) || meaningfulText(el).length > 120) return;
        }
      }

      if (hasEditableAncestor(el)) return;
      if (!meaningfulText(el)) return;
      if (el.getAttribute('aria-hidden') === 'true') return;

      const key = el.id ? ('id-' + el.id) : buildPathKey(el, 'txt');
      el.setAttribute('data-editable', key);
      el.setAttribute('contenteditable', 'false');
      textCount += 1;
    });

    root.querySelectorAll('[style*="background-image"]').forEach((el) => {
      if (isExcluded(el, excludeSelectors)) return;
      if (el.hasAttribute('data-editable-bg')) return;
      if (!el.style.backgroundImage || el.style.backgroundImage === 'none') return;
      if (el.closest('nav, button, footer a')) return;
      el.setAttribute('data-editable-bg', buildPathKey(el, 'bg'));
    });

    return { text: textCount, images: imageCount };
  }

  function applyContent(content) {
    if (!content || typeof content !== 'object') return;
    Object.keys(content).forEach((key) => {
      const value = content[key];
      if (value == null) return;
      if (key.startsWith('img_')) {
        const el = document.querySelector(`[data-editable-img="${cssEscape(key.slice(4))}"]`);
        if (el) el.src = value;
      } else if (key.startsWith('bg_')) {
        const el = document.querySelector(`[data-editable-bg="${cssEscape(key.slice(3))}"]`);
        if (el) el.style.backgroundImage = value;
      } else {
        const el = document.querySelector(`[data-editable="${cssEscape(key)}"]`);
        if (el) el.innerHTML = value;
      }
    });
  }

  function collectFields() {
    const fields = [];
    const seen = new Set();

    document.querySelectorAll('[data-editable]').forEach((el) => {
      const key = el.getAttribute('data-editable');
      if (!key || seen.has(key)) return;
      seen.add(key);
      fields.push({
        type: 'text',
        key: key,
        label: humanizeKey(key),
        value: el.innerHTML,
        preview: plainTextFromHtml(el.innerHTML).slice(0, 80),
      });
    });

    document.querySelectorAll('[data-editable-img]').forEach((el) => {
      const key = el.getAttribute('data-editable-img');
      if (!key || seen.has('img_' + key)) return;
      seen.add('img_' + key);
      fields.push({
        type: 'image',
        key: key,
        storageKey: 'img_' + key,
        label: humanizeKey(key) + ' (Image URL)',
        value: el.src || '',
      });
    });

    document.querySelectorAll('[data-editable-bg]').forEach((el) => {
      const key = el.getAttribute('data-editable-bg');
      if (!key || seen.has('bg_' + key)) return;
      seen.add('bg_' + key);
      const match = (el.style.backgroundImage || '').match(/url\(['"]?(.*?)['"]?\)/);
      fields.push({
        type: 'background',
        key: key,
        storageKey: 'bg_' + key,
        label: humanizeKey(key) + ' (Background URL)',
        value: match ? match[1] : '',
        raw: el.style.backgroundImage || '',
      });
    });

    return fields;
  }

  function focusPageElement(type, key) {
    document.querySelectorAll('.fm-field-focus').forEach((el) => el.classList.remove('fm-field-focus'));
    let el = null;
    if (type === 'text') el = document.querySelector(`[data-editable="${cssEscape(key)}"]`);
    if (type === 'image') el = document.querySelector(`[data-editable-img="${cssEscape(key)}"]`);
    if (type === 'background') el = document.querySelector(`[data-editable-bg="${cssEscape(key)}"]`);
    if (!el) return;
    el.classList.add('fm-field-focus');
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) { /* ignore */ }
    setTimeout(() => el.classList.remove('fm-field-focus'), 1200);
  }

  function applyFieldPreview(field, rawValue) {
    if (field.type === 'text') {
      const el = document.querySelector(`[data-editable="${cssEscape(field.key)}"]`);
      if (!el) return;
      // Preserve simple HTML if admin typed tags; otherwise use plain text
      const val = rawValue;
      if (/[<][a-zA-Z]/.test(val)) {
        el.innerHTML = val;
      } else {
        // Keep existing inline tags structure when possible by replacing text content
        el.textContent = val;
      }
      return;
    }
    if (field.type === 'image') {
      const el = document.querySelector(`[data-editable-img="${cssEscape(field.key)}"]`);
      if (el && rawValue.trim()) el.src = rawValue.trim();
      return;
    }
    if (field.type === 'background') {
      const el = document.querySelector(`[data-editable-bg="${cssEscape(field.key)}"]`);
      if (!el) return;
      const url = rawValue.trim();
      el.style.backgroundImage = url ? `url('${url}')` : '';
    }
  }

  function buildFormPanel(fields) {
    const { panel } = ensureChrome();
    const body = panel.querySelector('[data-fm-fields]');
    body.innerHTML = '';

    if (!fields.length) {
      body.innerHTML = '<p style="color:#6b7280;font-size:0.9rem;">No editable fields found on this page.</p>';
      return;
    }

    fields.forEach((field, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'fm-page-editor-field';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.htmlFor = 'fm-field-' + index;
      wrap.appendChild(label);

      if (field.preview && field.type === 'text') {
        const hint = document.createElement('div');
        hint.className = 'fm-field-hint';
        hint.textContent = field.preview;
        wrap.appendChild(hint);
      }

      let input;
      if (field.type === 'text') {
        input = document.createElement('textarea');
        input.rows = Math.min(8, Math.max(2, Math.ceil(plainTextFromHtml(field.value).length / 60)));
        // Edit as plain text for form UX like provider admin forms
        input.value = plainTextFromHtml(field.value);
        // Keep original HTML for cancel if unchanged structure needed
        field._originalHtml = field.value;
        field._plain = input.value;
      } else {
        input = document.createElement('input');
        input.type = 'url';
        input.placeholder = 'https://...';
        input.value = field.value || '';
      }
      input.id = 'fm-field-' + index;
      input.dataset.fmKey = field.key;
      input.dataset.fmType = field.type;

      input.addEventListener('focus', () => focusPageElement(field.type, field.key));
      input.addEventListener('input', () => {
        if (field.type === 'text') {
          // Write plain text back; if original had only text, fine.
          // If original had markup, replace with escaped text as HTML.
          const el = document.querySelector(`[data-editable="${cssEscape(field.key)}"]`);
          if (el) {
            const hadOnlyText = plainTextFromHtml(field._originalHtml) === (field._originalHtml || '').replace(/\s+/g, ' ').trim()
              || !/[<][a-zA-Z]/.test(field._originalHtml || '');
            if (hadOnlyText) {
              el.textContent = input.value;
            } else {
              // Keep a single text update without injecting tags from the form
              el.textContent = input.value;
            }
          }
        } else {
          applyFieldPreview(field, input.value);
        }
      });

      wrap.appendChild(input);
      body.appendChild(wrap);
    });

    setStatus(fields.length + ' fields');
  }

  async function loadContent(options) {
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(state.pageId)}/content`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      state.serverContent = data.content || {};

      const localKey = options && options.migrateLocalStorageKey;
      if (localKey && (!state.serverContent || !Object.keys(state.serverContent).length)) {
        try {
          const legacy = JSON.parse(localStorage.getItem(localKey) || '{}');
          if (legacy && typeof legacy === 'object' && Object.keys(legacy).length) {
            state.serverContent = legacy;
            applyContent(state.serverContent);
            const token = getAuthToken();
            if (token && (await isCurrentUserAdmin())) {
              const put = await fetch(`/api/pages/${encodeURIComponent(state.pageId)}/content`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify({ content: legacy }),
              });
              if (put.ok) localStorage.removeItem(localKey);
            }
            return;
          }
        } catch (_) { /* ignore */ }
      }

      applyContent(state.serverContent);
    } catch (err) {
      console.warn('FoodMapsPageEditor: failed to load page content', err);
    }
  }

  async function isCurrentUserAdmin() {
    const token = getAuthToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) return false;
      const user = await res.json();
      return !!(user && user.role && String(user.role).toLowerCase() === 'admin');
    } catch (_) {
      return false;
    }
  }

  async function refreshAdminAccess() {
    const { btn } = ensureChrome();
    const admin = await isCurrentUserAdmin();
    btn.style.display = admin ? 'flex' : 'none';
    if (!admin && state && state.isEditMode) cancelEdit(true);
  }

  function snapshotPage() {
    const snap = { text: {}, images: {}, backgrounds: {} };
    document.querySelectorAll('[data-editable]').forEach((el) => {
      const key = el.getAttribute('data-editable');
      if (key) snap.text[key] = el.innerHTML;
    });
    document.querySelectorAll('[data-editable-img]').forEach((el) => {
      const key = el.getAttribute('data-editable-img');
      if (key) snap.images[key] = el.src;
    });
    document.querySelectorAll('[data-editable-bg]').forEach((el) => {
      const key = el.getAttribute('data-editable-bg');
      if (key) snap.backgrounds[key] = el.style.backgroundImage;
    });
    return snap;
  }

  function enterEditMode() {
    if (state.fullPage) autoMarkFullPage(state.markOptions || {});
    state.original = snapshotPage();
    state.isEditMode = true;
    document.body.classList.add('edit-mode');
    const { btn } = ensureChrome();
    btn.classList.add('is-editing');
    const fields = collectFields();
    state.draftFields = fields;
    buildFormPanel(fields);
  }

  function exitEditMode() {
    state.isEditMode = false;
    document.body.classList.remove('edit-mode');
    const { btn, panel } = ensureChrome();
    btn.classList.remove('is-editing');
    document.querySelectorAll('.fm-field-focus').forEach((el) => el.classList.remove('fm-field-focus'));
    const body = panel.querySelector('[data-fm-fields]');
    if (body) body.innerHTML = '';
    setStatus('');
  }

  function restoreOriginal() {
    const snap = state.original || {};
    Object.keys(snap.text || {}).forEach((key) => {
      const el = document.querySelector(`[data-editable="${cssEscape(key)}"]`);
      if (el) el.innerHTML = snap.text[key];
    });
    Object.keys(snap.images || {}).forEach((key) => {
      const el = document.querySelector(`[data-editable-img="${cssEscape(key)}"]`);
      if (el) el.src = snap.images[key];
    });
    Object.keys(snap.backgrounds || {}).forEach((key) => {
      const el = document.querySelector(`[data-editable-bg="${cssEscape(key)}"]`);
      if (el) el.style.backgroundImage = snap.backgrounds[key];
    });
  }

  function toggleEditMode() {
    if (!state) return;
    if (state.isEditMode) cancelEdit();
    else enterEditMode();
  }

  function cancelEdit(silent) {
    restoreOriginal();
    exitEditMode();
    if (!silent) setStatus('');
  }

  function readFormChanges() {
    const changes = {};
    const panel = document.getElementById('fm-page-editor-panel');
    if (!panel) return changes;
    const inputs = panel.querySelectorAll('[data-fm-key]');
    inputs.forEach((input) => {
      const key = input.dataset.fmKey;
      const type = input.dataset.fmType;
      const value = input.value;
      if (type === 'text') {
        const originalPlain = plainTextFromHtml((state.original && state.original.text && state.original.text[key]) || '');
        if (value !== originalPlain) {
          // Store as text; escape HTML for safety unless empty
          const escaped = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          // Preserve line breaks
          changes[key] = escaped.replace(/\n/g, '<br>');
        }
      } else if (type === 'image') {
        const original = (state.original && state.original.images && state.original.images[key]) || '';
        if (value.trim() && value.trim() !== original) changes['img_' + key] = value.trim();
      } else if (type === 'background') {
        const url = value.trim();
        const next = url ? `url('${url}')` : '';
        const original = (state.original && state.original.backgrounds && state.original.backgrounds[key]) || '';
        if (next !== original) changes['bg_' + key] = next;
      }
    });
    return changes;
  }

  async function saveChanges() {
    if (!state || !state.isEditMode) return;
    const token = getAuthToken();
    if (!token) {
      alert('Please sign in as an admin to save.');
      return;
    }

    const changes = readFormChanges();
    if (!Object.keys(changes).length) {
      alert('No changes to save.');
      exitEditMode();
      return;
    }

    setStatus('Saving…');
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(state.pageId)}/content`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ content: changes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Save failed (${res.status})`);
      }
      const data = await res.json();
      state.serverContent = data.content || {};
      applyContent(state.serverContent);
      try {
        window.dispatchEvent(
          new CustomEvent('foodmaps:pagecontent-saved', {
            detail: { pageId: state.pageId, content: state.serverContent },
          })
        );
      } catch (_) { /* ignore */ }
      exitEditMode();
      alert('Changes saved successfully!');
    } catch (err) {
      console.error('FoodMapsPageEditor save failed', err);
      setStatus('Save failed');
      alert(err.message || 'Failed to save changes.');
    }
  }

  async function init(options) {
    const pageId = options && options.pageId;
    if (!pageId) {
      console.error('FoodMapsPageEditor.init requires pageId');
      return;
    }
    const fullPage = !options || options.fullPage !== false;
    state = {
      pageId,
      fullPage,
      markOptions: {
        root: options && options.root,
        excludeSelectors: options && options.excludeSelectors,
      },
      isEditMode: false,
      original: null,
      serverContent: {},
    };

    injectStyles();
    ensureChrome();
    if (fullPage) autoMarkFullPage(state.markOptions);
    await loadContent(options);
    await refreshAdminAccess();

    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_token' || e.key === 'current_user' || e.key === 'token') {
        refreshAdminAccess();
      }
    });

    global.toggleEditMode = toggleEditMode;
    global.saveChanges = saveChanges;
    global.cancelEdit = cancelEdit;
  }

  global.FoodMapsPageEditor = {
    init,
    refreshAdminAccess,
    loadContent,
    remarkAndApply: function () {
      if (!state) return;
      if (state.fullPage) autoMarkFullPage(state.markOptions || {});
      applyContent(state.serverContent || {});
    },
    reapply: function () {
      if (state && state.serverContent) applyContent(state.serverContent);
    },
    getServerContent: function () {
      return (state && state.serverContent) || {};
    },
  };
})(window);
