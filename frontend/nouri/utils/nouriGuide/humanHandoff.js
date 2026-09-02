let failureCount = 0;

export function getGuideFailureCount() {
  return failureCount;
}

export function shouldSuggestHumanHandoff() {
  return failureCount >= 3;
}

export function openHumanSupport() {
  window.dispatchEvent(new CustomEvent('foodmaps:navigate_ui', {
    detail: { action: 'open', target: 'dashboard', summary: 'Support' },
  }));
}

export function recordGuideFailure() {
  failureCount += 1;
  window.dispatchEvent(new CustomEvent('nouri:handoff-suggested'));
}
