/**
 * Shared helpers for every /api/ai/* client call.
 * Food Maps auth: Bearer from localStorage (auth_token / token).
 */

function readLocalToken() {
  try {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
  } catch {
    return null;
  }
}

/**
 * Return Authorization headers for AI backend calls.
 */
export async function getAiAuthHeaders(extra = {}) {
  const headers = { ...extra };
  const token = readLocalToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function clearAiAuthCache() {
  /* Food Maps reads localStorage live — nothing to clear. */
}

/**
 * Parse a failed Response into our structured error object, or null.
 */
export async function parseAiErrorResponse(response) {
  if (!response || response.ok) return null;
  let payload = null;
  try {
    payload = await response.clone().json();
  } catch (err) {
    console.warn('[aiRequest] response body was not JSON:', err?.message);
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  const body = (payload.error_code && payload)
    || (payload.detail && typeof payload.detail === 'object' && payload.detail.error_code && payload.detail)
    || null;
  if (!body) return null;
  const requestId = response.headers.get('X-Request-ID') || payload.request_id || body.request_id || null;
  return {
    code: body.error_code,
    message: body.message || payload.message || 'AI service error',
    retryable: !!body.retryable,
    retryAfter: body.retry_after_seconds ?? payload.retry_after_seconds ?? null,
    requestId,
    status: response.status,
  };
}

/**
 * Throw an Error with `.aiError` attached when the backend returns a typed body.
 */
export async function throwAiHttpError(response, fallbackMessage = 'AI request failed') {
  const err = await parseAiErrorResponse(response);
  const message = err?.message || `${fallbackMessage}: ${response.status}`;
  const e = new Error(message);
  if (err) e.aiError = err;
  e.requestId = err?.requestId || response.headers.get('X-Request-ID') || null;
  throw e;
}

/**
 * Pull the first navigate/ui directive out of normalized tool_results.
 */
export function extractActionFromToolResults(toolResults) {
  if (!Array.isArray(toolResults)) return null;
  for (const entry of toolResults) {
    if (!entry || (entry.tool !== 'navigate_ui' && entry.tool !== 'ui_action')) continue;
    const r = entry.result || entry;
    if (r.path && (r.action === 'navigate' || !r.action)) {
      return { action: 'navigate', target: r.path, path: r.path };
    }
    if (r.action && r.target) {
      return { action: r.action, target: r.target, path: r.path, view: r.view, focus: r.focus };
    }
    if (r.path) return { action: 'navigate', target: r.path, path: r.path };
  }
  return null;
}

/**
 * Merge auth headers into a fetch init object (immutable).
 */
export async function withAiAuth(init = {}) {
  const authHeaders = await getAiAuthHeaders();
  return {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers || {}),
    },
  };
}
