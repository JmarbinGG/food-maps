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
 * Allows CreateListing (qty) and legacy field names to resolve guide steps.
 */
export const FIELD_ALIASES = {
  qty: 'quantity',
  full_address: 'address',
  pickup_location: 'location',
  csv: 'csvFile',
  notes: 'requester_email',
  household_size: 'category',
  donor_name: 'title',
  expiry_date: 'perishability',
};

export const NOURI_GOALS = {
  'share-food': {
    formId: 'share-food',
    route: '/share',
    goal: 'share food',
    welcome:
      'Welcome to Food Maps Share Food! Look under this light-blue AI GUIDE card and fill Basic Info top to bottom, then Safety Check.',
    // Keep indices aligned with backend `_SHARE_GUIDED_UI` (CreateListing fields).
    steps: [
      { section: 'Open Share Food', label: 'Open Share Food', fieldName: '' },
      { section: 'Title', label: 'Title', fieldName: 'title' },
      { section: 'Description', label: 'Description', fieldName: 'description' },
      { section: 'Photos', label: 'Photos', fieldName: 'image' },
      { section: 'Category', label: 'Category', fieldName: 'category' },
      { section: 'Perishability', label: 'Perishability', fieldName: 'perishability' },
      { section: 'Quantity', label: 'Quantity', fieldName: 'quantity' },
      { section: 'Unit', label: 'Unit', fieldName: 'unit' },
      { section: 'Pickup address', label: 'Pickup Address', fieldName: 'address' },
      { section: 'Pickup window start', label: 'Pickup Window Start', fieldName: 'pickup_window_start' },
      { section: 'Pickup window end', label: 'Pickup Window End', fieldName: 'pickup_window_end' },
      { section: 'Continue to Safety Check', label: 'Continue to Safety Check', fieldName: 'safety' },
      { section: 'Finish & submit', label: 'Finish & Submit', fieldName: 'safety_done' },
    ],
  },
  'request-food': {
    formId: 'request-food',
    route: '/find',
    goal: 'request food',
    welcome:
      "Welcome! On Food Maps, tell Nouri what you need in chat, or use Find Food on the map. Click or tap whenever you need help.",
    // Aligned with backend `_REQUEST_GUIDED_UI` (6 steps).
    steps: [
      { section: 'Stay in chat', label: 'Stay in chat', fieldName: 'title' },
      { section: 'What you need', label: 'Food Needed', fieldName: 'title' },
      { section: 'How much', label: 'How much', fieldName: 'category' },
      { section: 'Your area', label: 'ZIP area', fieldName: 'school_district' },
      { section: 'Your contact', label: 'Contact Info', fieldName: 'requester_name' },
      { section: 'Next step', label: 'Search or Find Food', fieldName: 'requester_email' },
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
    welcome:
      'Find Food is the Food Maps home map. Set your ZIP, browse pins or the list, then Claim and confirm with your SMS code.',
    // Aligned with backend `_FIND_GUIDED_UI` (5 steps).
    steps: [
      { section: 'Open the map', label: 'Open map', fieldName: 'search' },
      { section: 'Your ZIP area', label: 'ZIP area', fieldName: 'zip' },
      { section: 'Browse listings', label: 'Map or list', fieldName: 'search' },
      { section: 'Claim it', label: 'Claim', fieldName: 'claimQty', dataGuideField: 'claimQty' },
      { section: 'Confirm claim', label: 'Confirm Claim', fieldName: 'confirmCode', dataGuideField: 'confirmCode' },
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

/** Hint text maps for form voice guide (Food Maps CreateListing fields). */
export const SHARE_FOOD_HINTS = {
  title: 'Enter a short name for the food you are sharing.',
  description: 'Add a few details so neighbors know what to expect.',
  category: 'Pick the category that best matches this food.',
  perishability: 'How quickly does this food spoil?',
  qty: 'How many portions or packages are available?',
  quantity: 'How many portions or packages are available?',
  unit: 'Choose Pounds, Items, Servings, or Ounces.',
  address: 'Enter the pickup address where neighbors can collect the food.',
  full_address: 'Enter the pickup address where neighbors can collect the food.',
  pickup_window_start: 'When can pickup start? Use Now for a quick start time.',
  pickup_window_end: 'When does the pickup window end? Use +2h for a quick end time.',
  image: 'Click Add photos to attach a photo of the food.',
  safety: 'Click Continue to Safety Check at the bottom.',
  safety_done: 'Complete the safety checklist, or click Skip Safety Check.',
};

export const REQUEST_FOOD_HINTS = {
  title: 'What food do you need?',
  category: 'Roughly how much do you need?',
  school_district: 'Check or update your ZIP search area.',
  requester_name: 'Confirm you are signed in so donors can reach you.',
  requester_email: 'I can search Find Food on the map for matches near you.',
  address: 'Where can you pick up food?',
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
