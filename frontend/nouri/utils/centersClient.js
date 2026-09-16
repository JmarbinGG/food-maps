/**
 * Food Maps API client (centers / communities).
 * Formerly named supabaseClient — no Supabase dependency.
 */
function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

function parseUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload.sub || payload.user_id || payload.id;
    return {
      id: id != null ? String(id) : null,
      email: payload.email || null,
      name: payload.name || payload.email || 'User',
      role: payload.role || 'recipient',
      is_admin: Boolean(payload.is_admin),
      community_id: payload.community_id ?? null,
      address: payload.address || null,
    };
  } catch {
    return null;
  }
}

function mapCenterRow(c) {
  if (!c || typeof c !== 'object') return null;
  const lat = c.latitude != null ? c.latitude : c.coords_lat;
  const lng = c.longitude != null ? c.longitude : c.coords_lng;
  return {
    ...c,
    id: c.id,
    name: c.name,
    description: c.description || '',
    address: c.address || '',
    location: c.location || c.address || '',
    phone: c.phone || '',
    hours: c.hours || '',
    contact: c.contact || '',
    website: c.website || '',
    social_media: c.social_media || '',
    logo_url: c.logo_url || '',
    image: c.image || c.logo_url || '',
    is_active: c.is_active !== false,
    latitude: lat != null && lat !== '' ? Number(lat) : null,
    longitude: lng != null && lng !== '' ? Number(lng) : null,
    coords_lat: lat != null && lat !== '' ? Number(lat) : null,
    coords_lng: lng != null && lng !== '' ? Number(lng) : null,
  };
}

function applyCommunityFilters(rows, filters) {
  let data = Array.isArray(rows) ? rows.slice() : [];
  for (const f of filters || []) {
    if (!f || !f.col) continue;
    if (f.col === 'is_active') {
      const want = f.val === true || f.val === 'true' || f.val === 1;
      data = data.filter((r) => Boolean(r.is_active) === want);
      continue;
    }
    data = data.filter((r) => String(r[f.col]) === String(f.val));
  }
  return data;
}

const centersClient = {
  from(table) {
    const builder = {
      _table: table,
      _filters: [],
      _select: '*',
      _order: null,
      _notNull: [],
      select(cols) {
        this._select = cols;
        return this;
      },
      eq(col, val) {
        this._filters.push({ col, val });
        return this;
      },
      not(col, op, val) {
        // FoodMap uses .not('latitude', 'is', null)
        if (op === 'is' && (val === null || val === 'null')) {
          this._notNull.push(col);
        }
        return this;
      },
      order(col, opts = {}) {
        this._order = { col, ascending: opts.ascending !== false };
        return this;
      },
      async then(resolve, reject) {
        try {
          if (this._table === 'communities') {
            const token = getToken();
            const res = await fetch('/api/centers', {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(await res.text());
            let raw = await res.json();
            let data = (raw || []).map(mapCenterRow).filter(Boolean);
            data = applyCommunityFilters(data, this._filters);
            for (const col of this._notNull) {
              const key = col === 'latitude' ? 'latitude'
                : col === 'longitude' ? 'longitude'
                  : col;
              data = data.filter((r) => {
                const v = r[key] != null ? r[key] : r[col];
                return v != null && v !== '' && !Number.isNaN(Number(v));
              });
            }
            if (this._order?.col === 'name') {
              data.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            }
            // Lightweight list consumers that only need id/name still work;
            // FoodMap receives full rows (coords, social, description).
            if (this._select && this._select !== '*' && typeof this._select === 'string') {
              const cols = this._select.split(',').map((s) => s.trim()).filter(Boolean);
              if (cols.length && cols.every((c) => c === 'id' || c === 'name' || c === 'is_active')) {
                data = data.map((c) => ({
                  id: c.id,
                  name: c.name,
                  is_active: c.is_active,
                }));
              }
            }
            resolve({ data, error: null });
            return;
          }
          resolve({ data: [], error: null });
        } catch (err) {
          if (reject) reject(err);
          else resolve({ data: null, error: err });
        }
      },
    };
    return builder;
  },
};

export default centersClient;
export { getToken, parseUserFromToken, mapCenterRow };
export const AUTH_TOKEN_KEY = 'auth_token';
/** @deprecated use AUTH_TOKEN_KEY */
export const SUPABASE_AUTH_KEY = AUTH_TOKEN_KEY;
