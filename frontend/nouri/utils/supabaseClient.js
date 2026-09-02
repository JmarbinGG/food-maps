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

const supabase = {
  from(table) {
    const builder = {
      _table: table,
      _filters: [],
      _select: '*',
      _order: null,
      select(cols) {
        this._select = cols;
        return this;
      },
      eq(col, val) {
        this._filters.push({ col, val });
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
            let data = await res.json();
            data = (data || []).map((c) => ({ id: c.id, name: c.name, is_active: true }));
            if (this._order?.col === 'name') {
              data.sort((a, b) => String(a.name).localeCompare(String(b.name)));
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

export default supabase;
export const SUPABASE_AUTH_KEY = 'auth_token';
