import { safeDownload } from './helpers.js';

const CSV_TEMPLATE = `title,quantity,unit,category,description,expiry_date,location
Apples,10,items,produce,Fresh apples,,
Bread,5,loaves,bakery,Day-old bread,,
`;

export function downloadCsvTemplate() {
  safeDownload('foodmaps-listings-template.csv', CSV_TEMPLATE);
}

export function matchCommunityByName(name, communities) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  return (communities || []).find((c) => String(c.name || '').toLowerCase() === n) || null;
}

export function sanitizeListingExpiry(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function visionDraftToRow(draft) {
  if (!draft) return null;
  return {
    title: draft.title || '',
    quantity: Number(draft.quantity) || 1,
    unit: draft.unit || 'items',
    category: draft.category || 'other',
    description: draft.description || '',
    dietary_tags: draft.dietary_tags || [],
    allergens: draft.allergens || [],
    expiry_date: draft.expiry_date || null,
    location: draft.location || '',
    community_id: draft.community_id || null,
    image_url: draft.image_url || null,
  };
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function parseListingsCsv(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors = [];
  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must include a header row and at least one data row.'] };
  }
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    if (cols.every((c) => !c)) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    const title = row.title || row.name;
    const qty = parseFloat(row.quantity || row.qty);
    if (!title) {
      errors.push(`Row ${i + 1}: missing title`);
      continue;
    }
    if (!qty || qty <= 0) {
      errors.push(`Row ${i + 1}: invalid quantity`);
      continue;
    }
    rows.push({
      title: String(title).slice(0, 200),
      quantity: qty,
      unit: String(row.unit || 'items').slice(0, 40) || 'items',
      category: String(row.category || 'other').toLowerCase(),
      description: row.description ? String(row.description).slice(0, 2000) : '',
      expiry_date: sanitizeListingExpiry(row.expiry_date || row.expiry),
      location: row.location || row.address || '',
      community_name: row.community || row.community_name || '',
      image_url: row.image_url || null,
    });
  }
  return { rows, errors };
}
