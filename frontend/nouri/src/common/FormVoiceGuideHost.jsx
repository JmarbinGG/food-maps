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
  // Host pages pass a fresh fieldHints object on every mountPanel() call;
  // key on its content so the hints identity is stable across renders.
  const hintsKey = JSON.stringify(fieldHints || null);
  const mergedHints = React.useMemo(
    () => ((fieldHints && Object.keys(fieldHints).length)
      ? { ...defaults.hints, ...fieldHints }
      : defaults.hints),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaults, hintsKey],
  );
  const { guide } = useFormVoiceGuide({
    formId,
    welcomeMessage: welcomeMessage || defaults.welcome,
    fieldHints: mergedHints,
  });
  return <FormVoiceGuide guide={guide} className={className} />;
}
