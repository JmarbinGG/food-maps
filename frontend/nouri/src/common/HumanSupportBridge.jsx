/**
 * Bridges Nouri human-handoff events into the AI chat panel.
 * Food Maps does not mount the DoGoods UserChatWidget (no realtime support inbox).
 */
import { useEffect } from 'react';

export default function HumanSupportBridge() {
  useEffect(() => {
    const openWithPrefill = (message) => {
      window.dispatchEvent(new CustomEvent('nouri:open-chat', {
        detail: { message: message || '' },
      }));
      if (typeof window.showAlert === 'function' && message) {
        window.showAlert(
          'Opening Nouri chat so you can reach a person for help. Describe what you need and an admin can follow up.',
          { title: 'Human support', variant: 'info' },
        );
      }
    };

    const onOpenSupport = (event) => {
      openWithPrefill(event?.detail?.message || 'I need help from a person with Food Maps.');
    };
    const onHandoffSuggested = () => {
      openWithPrefill('Nouri could not help me after several tries. I need a person to assist.');
    };

    window.addEventListener('nouri:open-human-support', onOpenSupport);
    window.addEventListener('nouri:handoff-suggested', onHandoffSuggested);
    return () => {
      window.removeEventListener('nouri:open-human-support', onOpenSupport);
      window.removeEventListener('nouri:handoff-suggested', onHandoffSuggested);
    };
  }, []);

  return null;
}
