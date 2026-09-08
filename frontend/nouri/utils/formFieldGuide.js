export const FORM_GUIDE_DESC_ID = 'nouri-form-guide-desc';

/** Notify Nouri guide context that a form field is focused (SPA listing forms). */
export function notifyFormFieldFocus(detail) {
  if (typeof window === 'undefined' || !detail || typeof detail !== 'object') return;
  window.dispatchEvent(new CustomEvent('foodmaps:form_focus', { detail }));
}

export function reapplyPendingGuideField() {
  /* no-op in Food Maps embed */
}

if (typeof window !== 'undefined') {
  window.nouriNotifyFormFocus = notifyFormFieldFocus;
}
