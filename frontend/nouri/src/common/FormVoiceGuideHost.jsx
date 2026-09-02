import React from 'react';
import FormVoiceGuide from './FormVoiceGuide.jsx';
import useFormVoiceGuide from '../../utils/hooks/useFormVoiceGuide.js';

export default function FormVoiceGuideHost({
  welcomeMessage = 'I can guide you through this form.',
  fieldHints = {},
  className = '',
}) {
  const { guide } = useFormVoiceGuide({ welcomeMessage, fieldHints });
  return <FormVoiceGuide guide={guide} className={className} />;
}
