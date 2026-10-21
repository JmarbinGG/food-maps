// Admin impact data entry — port of DoGoods /admin/impact.
// Two tables: organization impact (food saved / donated by partners) and
// communities served (families, school staff, food given per center).
// Rows are edited in place and saved on blur. Date filter and sub-tab live
// in the URL: /admin?tab=impact&dateFilter=current-week&view=communities

const IMPACT_DATE_FILTERS = [
  { id: 'current-week', label: 'Current Week' },
  { id: 'current-month', label: 'Current Month' },
  { id: 'all', label: 'All (Archived)' },
];

const IMPACT_ORG_COLUMNS = [
  { field: 'food_saved_from_waste_lb', label: 'Food Saved (lb)' },
  { field: 'food_donated_lb', label: 'Food Donated (lb)' },
];

const IMPACT_COMMUNITY_COLUMNS = [
  { field: 'families_helped', label: 'Families Helped', int: true },
  { field: 'school_staff_helped', label: 'School Staff Helped', int: true },
  { field: 'food_given_lb', label: 'Food Given (lb)' },
];

function impactIsoDate(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

// Inclusive local-date range for a filter. Compared as YYYY-MM-DD strings:
// new Date('2026-10-20') is UTC midnight, which is the previous day in
// California, so parsing row dates would drop entries at the edges.
function impactRange(filter) {
  const now = new Date();
  if (filter === 'current-week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // week starts Sunday, as in DoGoods
    return { start: impactIsoDate(start), end: null };
  }
  if (filter === 'current-month') {
    return { start: impactIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)), end: null };
  }
  return { start: null, end: null };
}

function impactErrorText(data, fallback) {
  const detail = data && data.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => String(d.msg || '').replace(/^Value error, /, '')).filter(Boolean).join('; ') || fallback;
  }
  return fallback;
}

function impactFormat(n) {
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function readImpactUrlState() {
  const params = new URLSearchParams(window.location.search);
  const dateFilter = params.get('dateFilter');
  const view = params.get('view');
  return {
    dateFilter: IMPACT_DATE_FILTERS.some((f) => f.id === dateFilter) ? dateFilter : 'current-week',
    view: view === 'communities' ? 'communities' : 'organizations',
  };
}

// Uncontrolled so typing never re-renders the table; saves on blur only
// when the value actually changed. Keyed by row id + updated_at upstream so
// a server-side change refreshes the shown value.
function ImpactCell({ value, type = 'text', onSave, inputRef, placeholder, list, int }) {
  return (
    <input
      ref={inputRef}
      type={type}
      list={list}
      min={type === 'number' ? 0 : undefined}
      step={type === 'number' ? (int ? 1 : 'any') : undefined}
      defaultValue={value ?? ''}
      placeholder={placeholder}
      onBlur={onSave ? (e) => {
        const raw = e.target.value;
        const next = type === 'number' ? (raw === '' ? 0 : Number(raw)) : raw;
        if (String(next) !== String(value ?? (type === 'number' ? 0 : ''))) onSave(next, e.target);
      } : undefined}
      className="w-full min-w-0 rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-200"
    />
  );
}

function ImpactDataEntry() {
  const initial = React.useMemo(readImpactUrlState, []);
  const [dateFilter, setDateFilter] = React.useState(initial.dateFilter);
  const [view, setView] = React.useState(initial.view);
  const [entries, setEntries] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [options, setOptions] = React.useState({ communities: [], organizations: [] });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const newRow = React.useRef({});

  const authHeaders = (json) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('auth_token')}` };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
  };

  // Keep the URL shareable, like DoGoods' ?dateFilter=current-week.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', 'impact');
    params.set('dateFilter', dateFilter);
    params.set('view', view);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}`);
  }, [dateFilter, view]);

  // Leaving the section (other tab, panel closed) drops the deep-link params.
  React.useEffect(() => () => {
    const params = new URLSearchParams(window.location.search);
    ['tab', 'dateFilter', 'view'].forEach((k) => params.delete(k));
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { start, end } = impactRange(dateFilter);
      const qs = new URLSearchParams();
      if (start) qs.set('start', start);
      if (end) qs.set('end', end);
      const res = await fetch(`/api/admin/impact?${qs.toString()}`, { headers: authHeaders(), cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(impactErrorText(data, 'Could not load impact data.'));
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || 'Could not load impact data.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  const loadOptions = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/impact/options', { headers: authHeaders(), cache: 'no-store' });
      if (res.ok) setOptions(await res.json());
    } catch (_) { /* the form still works with free-text organizations */ }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { loadOptions(); }, [loadOptions]);

  // One message at a time: a new error replaces a lingering "Saved." note.
  const showError = (msg) => {
    setInfo('');
    setError(msg);
  };

  const flash = (msg) => {
    setInfo(msg);
    setTimeout(() => setInfo((current) => (current === msg ? '' : current)), 2500);
  };

  const isOrgView = view === 'organizations';
  const rows = entries.filter((e) => (isOrgView ? e.kind === 'organization' : e.kind === 'community'));
  const columns = isOrgView ? IMPACT_ORG_COLUMNS : IMPACT_COMMUNITY_COLUMNS;
  const totals = columns.reduce((acc, c) => {
    acc[c.field] = rows.reduce((sum, r) => sum + (Number(r[c.field]) || 0), 0);
    return acc;
  }, {});

  const addEntry = async () => {
    const f = newRow.current;
    const body = { date: f.date?.value || impactIsoDate(new Date()), notes: f.notes?.value || null };
    if (isOrgView) body.organization = (f.organization?.value || '').trim();
    else body.community_id = Number(f.community_id?.value) || null;
    columns.forEach((c) => {
      const raw = f[c.field]?.value;
      body[c.field] = raw === '' || raw == null ? 0 : Number(raw);
    });
    if (isOrgView ? !body.organization : !body.community_id) {
      showError(isOrgView ? 'Choose or type an organization.' : 'Choose a community.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/impact', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(impactErrorText(data, 'Could not add the entry.'));
      ['organization', 'community_id', 'notes', ...columns.map((c) => c.field)].forEach((k) => {
        if (f[k]) f[k].value = '';
      });
      await load();
      if (isOrgView) loadOptions(); // a new organization joins the suggestions
      flash('Entry added.');
    } catch (e) {
      showError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = async (row, field, value, input) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/impact/${row.id}`, {
        method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(impactErrorText(data, 'Could not save the change.'));
      setEntries((prev) => prev.map((e) => (e.id === row.id ? data : e)));
      flash('Saved.');
    } catch (e) {
      showError(e.message);
      if (input) input.value = row[field] ?? ''; // put back the stored value
    }
  };

  const deleteEntry = async (row) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/impact/${row.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(impactErrorText(await res.json().catch(() => ({})), 'Could not delete the entry.'));
      setEntries((prev) => prev.filter((e) => e.id !== row.id));
      setTotal((t) => Math.max(0, t - 1));
      flash('Entry deleted.');
    } catch (e) {
      showError(e.message);
    }
  };

  const exportCsv = () => {
    const headers = ['Date', isOrgView ? 'Organization' : 'Community', ...columns.map((c) => c.label), 'Notes'];
    const lines = rows.map((r) => [
      r.date, isOrgView ? r.organization : r.community_name, ...columns.map((c) => r[c.field] ?? 0), r.notes || '',
    ]);
    const csv = [headers, ...lines]
      .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `impact_${view}_${dateFilter}_${impactIsoDate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const today = impactIsoDate(new Date());
  const cellClass = 'px-2 py-1.5 align-middle';

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Impact Data Entry</h2>
          <p className="text-sm text-gray-600 mt-1">Log organization and community impact. Totals update as you save.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { load(); loadOptions(); }} disabled={loading}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50">
            <div className={`icon-refresh-cw mr-2 ${loading ? 'animate-spin' : ''}`}></div>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" onClick={exportCsv} disabled={!rows.length}
            className="flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">
            <div className="icon-download mr-2"></div>
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Show entries from:</span>
          {IMPACT_DATE_FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setDateFilter(f.id)} aria-pressed={dateFilter === f.id}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${dateFilter === f.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-green-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-emerald-700">{rows.length}</span> of <span className="font-semibold">{total}</span> total entries
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 flex gap-6">
        {[
          { id: 'organizations', label: 'Organization Impact', icon: 'building-2' },
          { id: 'communities', label: 'Communities Served', icon: 'users' },
        ].map((t) => (
          <button key={t.id} type="button" onClick={() => setView(t.id)}
            className={`flex items-center py-2 border-b-2 text-sm font-medium ${view === t.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <div className={`icon-${t.icon} mr-2`}></div>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}
      {info && <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-lg text-sm" role="status">{info}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {columns.map((c) => (
          <div key={c.field} className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className="text-lg font-bold text-gray-900">{impactFormat(totals[c.field])}</div>
          </div>
        ))}
      </div>

      <datalist id="impact-organizations">
        {options.organizations.map((name) => <option key={name} value={name} />)}
      </datalist>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-2 py-2 min-w-[130px]">Date</th>
              <th className="px-2 py-2 min-w-[180px]">{isOrgView ? 'Organization' : 'Community'}</th>
              {columns.map((c) => <th key={c.field} className="px-2 py-2 min-w-[100px]">{c.label}</th>)}
              <th className="px-2 py-2 min-w-[180px]">Notes</th>
              <th className="px-2 py-2 w-16"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-green-50" key={`new-${view}`}>
              <td className={cellClass}><ImpactCell type="date" value={today} inputRef={(el) => { newRow.current.date = el; }} /></td>
              <td className={cellClass}>
                {isOrgView ? (
                  <ImpactCell list="impact-organizations" placeholder="Organization" value=""
                    inputRef={(el) => { newRow.current.organization = el; }} />
                ) : (
                  <select ref={(el) => { newRow.current.community_id = el; }} defaultValue=""
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none">
                    <option value="">Select community</option>
                    {options.communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </td>
              {columns.map((c) => (
                <td key={c.field} className={cellClass}>
                  <ImpactCell type="number" int={c.int} placeholder="0" value="" inputRef={(el) => { newRow.current[c.field] = el; }} />
                </td>
              ))}
              <td className={cellClass}><ImpactCell placeholder="Notes" value="" inputRef={(el) => { newRow.current.notes = el; }} /></td>
              <td className={cellClass}>
                <button type="button" onClick={addEntry} disabled={saving} aria-label="Add entry"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                  <div className="icon-plus"></div>
                </button>
              </td>
            </tr>

            {!loading && rows.map((row) => (
              <tr key={`${row.id}-${row.updated_at}`} className="hover:bg-gray-50">
                <td className={cellClass}>
                  <ImpactCell type="date" value={row.date} onSave={(v, el) => (v ? updateEntry(row, 'date', v, el) : (el.value = row.date))} />
                </td>
                <td className={cellClass}>
                  {isOrgView ? (
                    <ImpactCell list="impact-organizations" value={row.organization}
                      onSave={(v, el) => updateEntry(row, 'organization', v.trim(), el)} />
                  ) : (
                    <select value={row.community_id || ''} onChange={(e) => updateEntry(row, 'community_id', Number(e.target.value))}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none">
                      {!options.communities.some((c) => c.id === row.community_id) && (
                        <option value={row.community_id || ''}>{row.community_name || 'Unknown community'}</option>
                      )}
                      {options.communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </td>
                {columns.map((c) => (
                  <td key={c.field} className={cellClass}>
                    <ImpactCell type="number" int={c.int} value={row[c.field]} onSave={(v, el) => updateEntry(row, c.field, v, el)} />
                  </td>
                ))}
                <td className={cellClass}>
                  <ImpactCell value={row.notes || ''} onSave={(v, el) => updateEntry(row, 'notes', v, el)} />
                </td>
                <td className={cellClass}>
                  <button type="button" onClick={() => deleteEntry(row)} aria-label="Delete entry"
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50">
                    <div className="icon-trash-2"></div>
                  </button>
                </td>
              </tr>
            ))}

            {(loading || rows.length === 0) && (
              <tr>
                <td colSpan={columns.length + 4} className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Loading impact data…' : `No ${isOrgView ? 'organization' : 'community'} entries for this period. Add one using the green row above.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-semibold mb-1">How to use this</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Organization Impact:</strong> food saved from waste and food donated by partner organizations.</li>
          <li><strong>Communities Served:</strong> families and school staff helped and food given at each community.</li>
          <li>Fill in the green row and press <strong>+</strong> to add an entry. Edit any cell and click away to save.</li>
          <li>The totals above cover the entries shown. Export CSV saves the current table.</li>
        </ul>
      </div>
    </div>
  );
}

window.ImpactDataEntry = ImpactDataEntry;
