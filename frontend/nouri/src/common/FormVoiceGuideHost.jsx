import React from 'react';
import FormVoiceGuide from './FormVoiceGuide.jsx';
import useFormVoiceGuide, {
  SHARE_FOOD_HINTS,
  REQUEST_FOOD_HINTS,
  BULK_UPLOAD_HINTS,
  SHARE_FOOD_WELCOME,
  REQUEST_FOOD_WELCOME,
  BULK_UPLOAD_WELCOME,
} from '../../utils/hooks/useFormVoiceGuide.js';

const DEFAULTS_BY_FORM = {
  'share-food': { welcome: SHARE_FOOD_WELCOME, hints: SHARE_FOOD_HINTS },
  'share-listing': { welcome: SHARE_FOOD_WELCOME, hints: SHARE_FOOD_HINTS },
  'request-food': { welcome: REQUEST_FOOD_WELCOME, hints: REQUEST_FOOD_HINTS },
  'request-help': { welcome: REQUEST_FOOD_WELCOME, hints: REQUEST_FOOD_HINTS },
  'bulk-upload': { welcome: BULK_UPLOAD_WELCOME, hints: BULK_UPLOAD_HINTS },
  'bulk-share': { welcome: BULK_UPLOAD_WELCOME, hints: BULK_UPLOAD_HINTS },
};

export default function FormVoiceGuideHost({
  welcomeMessage,
  fieldHints,
  formId = 'share-food',
  className = '',
}) {
  const defaults = DEFAULTS_BY_FORM[formId] || DEFAULTS_BY_FORM['share-food'];
  const { guide } = useFormVoiceGuide({
    formId,
    welcomeMessage: welcomeMessage || defaults.welcome,
    fieldHints: (fieldHints && Object.keys(fieldHints).length)
      ? { ...defaults.hints, ...fieldHints }
      : defaults.hints,
  });
  return <FormVoiceGuide guide={guide} className={className} />;
}
