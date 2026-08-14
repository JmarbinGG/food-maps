function AIBroadcastsPanel() {
  const [status, setStatus] = React.useState('pending');
  const [broadcasts, setBroadcasts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(null); // id of row being acted on, or 'batch' / 'run'
  const [editDrafts, setEditDrafts] = React.useState({}); // { id: { message, channel } }
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const token = () => localStorage.getItem('auth_token');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Cache-bust: a stale CDN/proxy/browser cache was leaving approved
      // rows visible in the Pending tab. ?_t= forces a fresh fetch and
      // cache:'no-store' opts out of the HTTP cache entirely.
      const res = await fetch(
        `/api/ai/broadcasts?status=${encodeURIComponent(status)}&limit=200&_t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
          cache: 'no-store',
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBroadcasts(Array.isArray(data.broadcasts) ? data.broadcasts : []);
    } catch (e) {
      console.error('Failed to load broadcasts:', e);
      setError('Could not load broadcasts. Are you signed in as admin?');
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => { load(); }, [load]);

  const setDraft = (id, patch) => {
    setEditDrafts(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  const approve = async (b) => {
    setBusy(b.id); setError(''); setInfo('');
    try {
      const body = {};
      const d = editDrafts[b.id] || {};
      if (d.message && d.message.trim() && d.message.trim() !== b.message) body.message = d.message.trim();
      if (d.channel && d.channel !== b.channel) body.channel = d.channel;
      const res = await fetch(`/api/ai/broadcasts/${b.id}/approve`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      // Optimistic local removal so the row disappears even if a stale CDN
      // cache briefly serves the old list on the follow-up GET.
      setBroadcasts(prev => prev.filter(x => x.id !== b.id));
      setEditDrafts(prev => { const n = { ...prev }; delete n[b.id]; return n; });
      const ok = data?.delivery?.ok;
      setInfo(ok
        ? `Broadcast #${b.id} approved and sent.`
        : `Broadcast #${b.id} approved, but delivery reported: ${data?.delivery?.error || 'unknown'}.`);
      await load();
    } catch (e) {
      setError(`Approve failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const reject = async (b) => {
    if (!window.confirm('Reject this broadcast? It will not be sent.')) return;
    setBusy(b.id); setError(''); setInfo('');
    try {
      const res = await fetch(`/api/ai/broadcasts/${b.id}/reject`, {
        method: 'POST',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setBroadcasts(prev => prev.filter(x => x.id !== b.id));
      setInfo(`Broadcast #${b.id} rejected.`);
      await load();
    } catch (e) {
      setError(`Reject failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const approveAllPending = async () => {
    if (!window.confirm(`Approve + send ALL ${broadcasts.length} pending broadcast(s)?`)) return;
    setBusy('batch'); setError(''); setInfo('');
    try {
      const res = await fetch('/api/ai/broadcasts/approve_batch', {
        method: 'POST',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setBroadcasts([]);
      setInfo(`Sent ${data.sent ?? 0} broadcast(s).`);
      await load();
    } catch (e) {
      setError(`Batch approve failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const runNow = async () => {
    setBusy('run'); setError(''); setInfo('');
    try {
      const res = await fetch('/api/ai/broadcasts/run_now', {
        method: 'POST',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      const stats = data.stats || {};
      setInfo(`Scan complete: ${stats.drafts ?? 0} draft(s) from ${stats.listings ?? 0} listing(s).`);
      if (status === 'pending') await load();
    } catch (e) {
      setError(`Run failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const statusBadge = (s) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-200 text-gray-700',
      failed: 'bg-red-100 text-red-700',
    };
    return `px-2 py-0.5 rounded text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-700'}`;
  };

  return (
    <div data-name="ai-broadcasts-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">AI Broadcasts</h3>
          <p className="text-sm text-gray-500">
            Hourly job drafts SMS / in-app messages about new listings. Review and approve before they go out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={load}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={runNow}
            disabled={busy === 'run'}
            className="px-3 py-1 text-sm border border-blue-300 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            {busy === 'run' ? 'Scanning…' : 'Run scan now'}
          </button>
          {status === 'pending' && broadcasts.length > 0 && (
            <button
              onClick={approveAllPending}
              disabled={busy === 'batch'}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {busy === 'batch' ? 'Sending…' : `Approve all (${broadcasts.length})`}
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      {info && <div className="mb-3 p-2 bg-green-50 text-green-700 rounded text-sm">{info}</div>}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : broadcasts.length === 0 ? (
        <div className="text-gray-500 text-sm border rounded p-6 text-center">
          No broadcasts with status <strong>{status}</strong>.
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => {
            const draft = editDrafts[b.id] || {};
            const msg = draft.message ?? b.message;
            const ch = draft.channel ?? b.channel;
            const actionable = b.status === 'pending' || b.status === 'failed';
            return (
              <div key={b.id} className="border rounded p-3 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono">#{b.id}</span>
                    <span className={statusBadge(b.status)}>{b.status}</span>
                    <span>user {b.user_id}</span>
                    {b.food_resource_id && <span>listing {b.food_resource_id}</span>}
                    <span>{b.language?.toUpperCase() || 'EN'}</span>
                    {b.batch_id && <span title="batch id" className="text-gray-400">batch {b.batch_id.slice(0, 8)}</span>}
                    {b.created_at && <span>{new Date(b.created_at).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    {actionable && (
                      <select
                        value={ch}
                        onChange={(e) => setDraft(b.id, { channel: e.target.value })}
                        className="border rounded text-xs px-1 py-0.5"
                      >
                        <option value="sms">SMS</option>
                        <option value="chat">In-app chat</option>
                        <option value="both">Both</option>
                      </select>
                    )}
                    {actionable && (
                      <button
                        onClick={() => approve(b)}
                        disabled={busy === b.id}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {busy === b.id ? '…' : 'Approve & send'}
                      </button>
                    )}
                    {b.status === 'pending' && (
                      <button
                        onClick={() => reject(b)}
                        disabled={busy === b.id}
                        className="px-3 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
                {actionable ? (
                  <textarea
                    value={msg}
                    onChange={(e) => setDraft(b.id, { message: e.target.value })}
                    rows={3}
                    className="w-full border rounded p-2 text-sm font-mono"
                  />
                ) : (
                  <div className="text-sm whitespace-pre-wrap bg-gray-50 border rounded p-2">{msg}</div>
                )}
                {b.error && (
                  <div className="mt-1 text-xs text-red-600">error: {b.error}</div>
                )}
                {b.sent_at && (
                  <div className="mt-1 text-xs text-gray-500">sent {new Date(b.sent_at).toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.AIBroadcastsPanel = AIBroadcastsPanel;
