/**
 * Parse guided-mode headers from Nouri assistant messages.
 * Matches backend _guided_format_step output.
 */

import { NOURI_GOALS, getStepMeta } from './registry'

/** @typedef {{ stepIndex: number, stepTotal: number, goalPhrase: string, section: string, goalKey: string|null, fieldName: string|null }} ParsedGuidedStep */

const STEP_RE = /(?:GUIDED\s*[—–-]\s*STEP|GUIADO\s*[—–-]\s*PASO)\s*(\d+)\s*(?:of|de)\s*(\d+)\s*(?:\(([^)]+)\))?\s*(?:[—–-]\s*([^\n[]+))?/i
const FIELD_RE = /\[field:([a-z0-9_]+)\]/i

/** Keyword → field for headerless guided coaching replies (Food Maps CreateListing). */
const FIELD_HINTS = [
  { field: 'title', re: /\btitle\b|food name|nombre del alimento|what food are you sharing|qué estás donando|que estas donando|fresh vegetables|verduras/i },
  { field: 'description', re: /\bdescription\b|descripción|descripcion|short sentence|frase corta/i },
  { field: 'image', re: /\bphoto\b|\bfotos?\b|add photos|añadir fotos|optional/i },
  { field: 'category', re: /\bcategory\b|categoría|categoria/i },
  { field: 'perishability', re: /perishab|perecedero|spoils|echa a perder/i },
  { field: 'quantity', re: /\bquantity\b|cantidad|how many|cuántos|cuantos/i },
  { field: 'unit', re: /\bunit\b|unidad(?!es de)|pounds|servings|ounces/i },
  { field: 'address', re: /pickup address|dirección de recogida|direccion de recogida|mapbox|selected address/i },
  { field: 'pickup_window_start', re: /window start|inicio de|pickup must|tap now|\bnow\b/i },
  { field: 'pickup_window_end', re: /window end|fin de|\+2h|after the start/i },
  { field: 'safety', re: /continue to safety|continuar a (?:revisión de )?seguridad|green button continue/i },
  { field: 'safety_done', re: /skip safety|saltar revisión|finish & submit|awaiting approval|pendiente de aprobación|complete the safety/i },
  { field: 'requester_name', re: /your name|tu nombre|signed in|iniciado sesión/i },
  { field: 'requester_email', re: /search find food|buscar en buscar|open find food/i },
  { field: 'school_district', re: /school|community|comunidad|escuela/i },
  { field: 'zip', re: /\bzip\b|código postal|codigo postal|update search area|search this area|buscar en esta zona/i },
  { field: 'search', re: /map pins|all listings|food listings|\blist\b|browse|pines|todas las publicaciones/i },
  { field: 'claimQty', re: /claim this food|tap claim|pulsa reclamar|reclamar esta comida/i },
  { field: 'confirmCode', re: /4-digit|confirm claim|confirm your claim|confirmar reclamo|sms code/i },
]

/**
 * @param {string} message
 * @returns {ParsedGuidedStep|null}
 */
export function parseGuidedStepHeader(message) {
  if (!message) return null
  const m = message.match(STEP_RE)
  if (!m) return null

  const stepIndex = Math.max(1, parseInt(m[1], 10)) - 1
  const stepTotal = parseInt(m[2], 10)
  const goalPhrase = (m[3] || '').trim()
  const section = (m[4] || '').trim().replace(/\s*\[field:[^\]]+\]\s*$/i, '').trim()
  const fieldMatch = message.match(FIELD_RE)
  let fieldName = fieldMatch ? fieldMatch[1] : null

  let goalKey = null
  const gp = goalPhrase.toLowerCase()
  if (gp.includes('share') || gp.includes('compartir')) goalKey = 'share-food'
  else if (gp.includes('request') || gp.includes('solicit')) goalKey = 'request-food'
  else if (gp.includes('claim') || gp.includes('reclamar')) goalKey = 'claim-food'
  else if (gp.includes('find') || gp.includes('buscar')) goalKey = 'find-food'
  else if (gp.includes('sign in') || gp.includes('login')) goalKey = 'login'
  else if (gp.includes('sign up') || gp.includes('signup')) goalKey = 'signup'

  if (!fieldName && goalKey) {
    const meta = getStepMeta(goalKey, stepIndex)
    fieldName = meta?.fieldName || null
  }

  return { stepIndex, stepTotal, goalPhrase, section, goalKey, fieldName }
}

/**
 * When the model drops the GUIDED header, infer goal + field from coaching text.
 * @param {string} message
 * @param {string|null} [fallbackGoalKey]
 * @returns {ParsedGuidedStep|null}
 */
export function inferGuidedFieldFromText(message, fallbackGoalKey = null) {
  if (!message) return null
  const t = String(message)
  const looksGuided = (
    /guided|guiado|baby step|paso de bebé|paso de bebe|say done|di listo|look at the top|mira arriba|tap |pulsa /i.test(t)
  )
  if (!looksGuided && !fallbackGoalKey) return null

  let goalKey = fallbackGoalKey
  if (!goalKey) {
    if (/share food|compartir|basic info|safety check|food maps share/i.test(t)) goalKey = 'share-food'
    else if (/request food|solicitar/i.test(t)) goalKey = 'request-food'
    else if (/find food|buscar comida|claim this food|food maps map|zip chip|confirm claim/i.test(t)) goalKey = 'find-food'
    else if (fallbackGoalKey) goalKey = fallbackGoalKey
    else goalKey = 'share-food'
  }

  const goal = NOURI_GOALS[goalKey]
  if (!goal) return null

  let fieldName = null
  for (const hint of FIELD_HINTS) {
    if (hint.re.test(t)) {
      // Only accept if this field exists on the goal.
      if (goal.steps.some((s) => s.fieldName === hint.field)) {
        fieldName = hint.field
        break
      }
    }
  }

  const stepIndex = fieldName
    ? Math.max(0, goal.steps.findIndex((s) => s.fieldName === fieldName))
    : 0
  const meta = goal.steps[stepIndex]

  if (!fieldName && !looksGuided) return null

  return {
    stepIndex,
    stepTotal: goal.steps.length,
    goalPhrase: goal.goal,
    section: meta?.section || '',
    goalKey,
    fieldName: fieldName || meta?.fieldName || null,
  }
}

/** Strip guided header for caption display */
export function stripGuidedHeader(message) {
  if (!message) return ''
  const lines = message.split('\n')
  if (lines.length <= 1) return message.replace(STEP_RE, '').trim()
  if (STEP_RE.test(lines[0])) {
    return lines.slice(1).join('\n').trim()
  }
  return message
}

/**
 * @param {string} text
 * @param {boolean} simpleLanguage
 */
export function simplifyGuideText(text, simpleLanguage) {
  if (!simpleLanguage || !text) return text
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[#*_~`]/g, '')
    .split(/(?<=[.!?])\s+/)
    .slice(0, 4)
    .join(' ')
    .trim()
}
