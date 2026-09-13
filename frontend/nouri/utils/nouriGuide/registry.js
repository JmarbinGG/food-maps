/**
 * Unified step registry — maps chat guided steps ↔ form DOM fields.
 * Mirrors backend _SHARE_GUIDED_UI / _REQUEST_GUIDED_UI / _FIND_GUIDED_UI indices.
 */

/** @typedef {{ fieldName?: string, section: string, label: string, dataGuideField?: string }} GuideStepMeta */

/** @typedef {{ formId: string, route: string, goal: string, welcome: string, steps: GuideStepMeta[] }} GoalRegistryEntry */

/** Live SPA formIds → registry formId / goal key */
export const FORM_ID_ALIASES = {
  'share-listing': 'share-food',
  'request-help': 'request-food',
  'bulk-share': 'bulk-upload',
};

/**
 * Live SPA field names → registry / GUIDED field names.
 * Allows CreateListing (qty/address) and similar to resolve guide steps.
 */
export const FIELD_ALIASES = {
  qty: 'quantity',
  address: 'full_address',
  pickup_location: 'location',
  csv: 'csvFile',
  notes: 'requester_email',
  household_size: 'category',
};

export const NOURI_GOALS = {
  'share-food': {
    formId: 'share-food',
    route: '/share',
    goal: 'share food',
    welcome:
      'Welcome! This form has two sections: donor information at the top, and food listing details below. Click or tap any field whenever you need help.',
    // Keep indices aligned with backend `_SHARE_GUIDED_UI` (one field per step).
    steps: [
      { section: 'Open Share Food', label: 'Open Share Food', fieldName: '' },
      { section: 'Your name', label: 'Name / Organization', fieldName: 'donor_name' },
      { section: 'Donor type', label: 'Donor Type', fieldName: 'donor_type' },
      { section: 'ZIP code', label: 'ZIP Code', fieldName: 'donor_zip' },
      { section: 'City', label: 'City', fieldName: 'donor_city' },
      { section: 'State', label: 'State', fieldName: 'donor_state' },
      { section: 'Community', label: 'Community', fieldName: 'school_district' },
      { section: 'Email or phone', label: 'Email', fieldName: 'donor_email' },
      { section: 'Pickup address', label: 'Pickup Address', fieldName: 'full_address' },
      { section: 'Food name', label: 'Food Name', fieldName: 'title' },
      { section: 'Category', label: 'Category', fieldName: 'category' },
      { section: 'Description', label: 'Description', fieldName: 'description' },
      { section: 'Quantity', label: 'Quantity', fieldName: 'quantity' },
      { section: 'Unit', label: 'Unit', fieldName: 'unit' },
      { section: 'Expiration', label: 'Expiration Date', fieldName: 'expiry_date' },
      { section: 'Photo & submit', label: 'Photo & Submit', fieldName: 'image' },
    ],
  },
  'request-food': {
    formId: 'request-food',
    route: '/request',
    goal: 'request food',
    welcome:
      "Welcome! I'll guide you step by step through your food request. Click or tap any field whenever you need help.",
    // Aligned with backend `_REQUEST_GUIDED_UI` (6 steps).
    steps: [
      { section: 'Open Request Food', label: 'Open Request Food', fieldName: 'title' },
      { section: 'What you need', label: 'Food Needed', fieldName: 'title' },
      { section: 'How much', label: 'Category & Quantity', fieldName: 'category' },
      { section: 'Community', label: 'Community', fieldName: 'school_district' },
      { section: 'Your contact', label: 'Contact Info', fieldName: 'requester_name' },
      { section: 'Submit', label: 'Submit', fieldName: 'requester_email' },
    ],
  },
  'claim-food': {
    formId: 'claim-food',
    route: '/claim',
    goal: 'claim food',
    welcome:
      "Welcome! I'll guide you step by step through confirming your claim. Click or tap any field whenever you need help.",
    steps: [
      { section: 'Claim', label: 'Portions', dataGuideField: 'claimQty' },
    ],
  },
  'find-food': {
    formId: 'find-food',
    route: '/find',
    goal: 'find food',
    welcome: 'Browse available food listings or tell Nouri what you need.',
    // Aligned with backend `_FIND_GUIDED_UI` (4 steps).
    steps: [
      { section: 'Open Find Food', label: 'Browse listings', fieldName: 'search' },
      { section: 'What to look for', label: 'Search', fieldName: 'search' },
      { section: 'Look at results', label: 'Results', fieldName: 'search' },
      { section: 'Claim it', label: 'Claim', fieldName: 'claimQty', dataGuideField: 'claimQty' },
    ],
  },
  login: {
    formId: 'login',
    route: '/login',
    goal: 'sign in',
    welcome: 'Sign in with your email and password.',
    steps: [
      { section: 'Sign in', label: 'Email', fieldName: 'email' },
      { section: 'Sign in', label: 'Password', fieldName: 'password' },
    ],
  },
  signup: {
    formId: 'signup',
    route: '/signup',
    goal: 'sign up',
    welcome: 'Create your Food Maps account.',
    steps: [
      { section: 'Account', label: 'Name', fieldName: 'name' },
      { section: 'Account', label: 'Email', fieldName: 'email' },
      { section: 'Approval', label: 'Approval number', fieldName: 'approvalNumber' },
      { section: 'Security', label: 'Password', fieldName: 'password' },
      { section: 'Submit', label: 'Terms', fieldName: 'agreeToTerms' },
    ],
  },
  receipts: {
    formId: 'receipts',
    route: '/receipts',
    goal: 'receipts',
    welcome: 'View your food pickup receipts.',
    steps: [
      { section: 'Receipts', label: 'Filter tabs', dataGuideField: 'receiptsTabs' },
    ],
  },
  'bulk-upload': {
    formId: 'bulk-upload',
    route: '/listings',
    goal: 'bulk upload',
    welcome: 'Upload multiple listings with a CSV file.',
    steps: [
      { section: 'Upload', label: 'CSV file', fieldName: 'csvFile' },
      { section: 'Details', label: 'Location', fieldName: 'location' },
    ],
  },
};

/** Normalize a live formId (SPA alias or canonical). */
export function canonicalFormId(formId) {
  if (!formId) return null;
  return FORM_ID_ALIASES[formId] || formId;
}

/** Normalize a live field name to registry field name. */
export function canonicalFieldName(fieldName) {
  if (!fieldName) return fieldName;
  return FIELD_ALIASES[fieldName] || fieldName;
}

/** @param {string} formId */
export function getGoalByFormId(formId) {
  const id = canonicalFormId(formId);
  return Object.values(NOURI_GOALS).find((g) => g.formId === id) || null;
}

/** @param {string} goalPhrase e.g. "share food" */
export function getGoalByPhrase(goalPhrase) {
  const t = (goalPhrase || '').toLowerCase();
  if (t.includes('share') || t.includes('bulk')) return NOURI_GOALS['share-food'];
  if (t.includes('request')) return NOURI_GOALS['request-food'];
  if (t.includes('claim')) return NOURI_GOALS['claim-food'];
  if (t.includes('find')) return NOURI_GOALS['find-food'];
  return null;
}

/** @param {string} goalKey */
export function getStepMeta(goalKey, stepIndex) {
  const goal = NOURI_GOALS[goalKey];
  if (!goal) return null;
  return goal.steps[stepIndex] || null;
}

/** Resolve guided step index from a live form field name. */
export function getStepIndexForField(goalKey, fieldName) {
  const goal = NOURI_GOALS[goalKey];
  if (!goal || !fieldName) return -1;
  const canonical = canonicalFieldName(fieldName);
  let idx = goal.steps.findIndex((s) => s.fieldName === canonical || s.dataGuideField === canonical);
  if (idx >= 0) return idx;
  idx = goal.steps.findIndex((s) => s.fieldName === fieldName || s.dataGuideField === fieldName);
  return idx;
}

export function goalKeyFromFormId(formId) {
  const id = canonicalFormId(formId);
  const entry = Object.entries(NOURI_GOALS).find(([, g]) => g.formId === id);
  return entry ? entry[0] : null;
}

/** Map formId string to goal key (supports registry keys and SPA aliases). */
export function resolveGoalKey(formId) {
  if (NOURI_GOALS[formId]) return formId;
  const aliased = FORM_ID_ALIASES[formId];
  if (aliased && NOURI_GOALS[aliased]) return aliased;
  return goalKeyFromFormId(formId);
}

/** Hint text maps for form voice guide (SPA field names). */
export const SHARE_FOOD_HINTS = {
  title: 'Enter a short name for the food you are sharing.',
  description: 'Add a few details so neighbors know what to expect.',
  category: 'Pick the category that best matches this food.',
  qty: 'How many portions or packages are available?',
  quantity: 'How many portions or packages are available?',
  unit: 'Choose the unit that matches your quantity.',
  address: 'Enter the pickup address where neighbors can collect the food.',
  full_address: 'Enter the pickup address where neighbors can collect the food.',
  pickup_window_start: 'When can pickup start?',
  pickup_window_end: 'When does the pickup window end?',
  image: 'Optional: add a photo of the food.',
  donor_name: 'Enter your name or organization.',
  donor_type: 'Are you sharing as an individual/family or an organization?',
  donor_zip: 'Enter your ZIP code.',
  donor_city: 'Enter your city.',
  donor_state: 'Select your state.',
  school_district: 'Choose your school or community.',
  donor_email: 'Enter an email so neighbors can reach you if needed.',
  expiry_date: 'When should this food be used by?',
};

export const REQUEST_FOOD_HINTS = {
  title: 'What food do you need?',
  category: 'Pick a category and how much you need.',
  school_district: 'Choose your school or community.',
  requester_name: 'Enter your name so donors know who to help.',
  requester_email: 'Enter an email so we can follow up.',
  address: 'Where should help be delivered or picked up?',
  notes: 'Add any notes about dietary needs or timing.',
  household_size: 'How many people are in your household?',
};

export const BULK_UPLOAD_HINTS = {
  csv: 'Choose a CSV file with title, quantity, unit, and category columns.',
  csvFile: 'Choose a CSV file with title, quantity, unit, and category columns.',
  title: 'Enter the food title for this row.',
  pickup_location: 'Enter the pickup location for these listings.',
  location: 'Enter the pickup location for these listings.',
};
