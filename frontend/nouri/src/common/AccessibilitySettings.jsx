import React from 'react';
import { useNouriGuide } from '../../utils/NouriGuideContext.jsx';
import {
  GUIDE_LANGUAGE_LABELS,
  SUPPORTED_GUIDE_LANGUAGES,
} from '../../utils/guideLang.js';

function ToggleRow({ id, label, description, checked, onChange }) {
  return (
    <div className="nouri-a11y-row">
      <div className="nouri-a11y-row-text">
        <label htmlFor={id} className="nouri-a11y-label">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="nouri-a11y-desc">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={`nouri-a11y-switch ${checked ? 'is-on' : ''}`}
      >
        <span className="nouri-a11y-switch-thumb" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

export default function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings } = useNouriGuide();

  return (
    <div className="nouri-a11y-panel" role="region" aria-labelledby="nouri-a11y-heading">
      <h2 id="nouri-a11y-heading" className="nouri-a11y-title">
        Accessibility
      </h2>
      <p className="nouri-a11y-intro">
        Customize display, motion, and how Nouri speaks. Settings save on this device.
      </p>

      <div className="nouri-a11y-lang">
        <label htmlFor="a11y-preferred-language" className="nouri-a11y-label">
          Preferred language
        </label>
        <p id="a11y-preferred-language-desc" className="nouri-a11y-desc">
          Nouri will try to respond in this language in chat and guided steps.
        </p>
        <select
          id="a11y-preferred-language"
          aria-describedby="a11y-preferred-language-desc"
          value={settings.preferredLanguage || 'en'}
          onChange={(e) => updateSetting('preferredLanguage', e.target.value)}
          className="nouri-a11y-select"
        >
          {SUPPORTED_GUIDE_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {GUIDE_LANGUAGE_LABELS[code]}
            </option>
          ))}
        </select>
      </div>

      <div className="nouri-a11y-toggles">
        <ToggleRow
          id="a11y-large-text"
          label="Large text"
          description="Increases text size across the app."
          checked={!!settings.largeText}
          onChange={(v) => updateSetting('largeText', v)}
        />
        <ToggleRow
          id="a11y-high-contrast"
          label="High contrast"
          description="Stronger text and focus outlines for easier reading."
          checked={!!settings.highContrast}
          onChange={(v) => updateSetting('highContrast', v)}
        />
        <ToggleRow
          id="a11y-reduce-motion"
          label="Reduce motion"
          description="Minimizes animations and smooth scrolling."
          checked={!!settings.reduceMotion}
          onChange={(v) => updateSetting('reduceMotion', v)}
        />
        <ToggleRow
          id="a11y-captions"
          label="Always show captions"
          description="Shows a text bar whenever Nouri speaks in chat or on forms."
          checked={!!settings.alwaysShowCaptions}
          onChange={(v) => updateSetting('alwaysShowCaptions', v)}
        />
        <ToggleRow
          id="a11y-form-voice"
          label="Form voice guide"
          description={
            settings.preferTextOverVoice
              ? 'Turn off "Prefer text over voice" above to enable spoken form hints.'
              : 'Nouri reads form field hints aloud when you focus a field. Text hints still appear when this is off.'
          }
          checked={!!settings.formVoiceGuideEnabled}
          onChange={(v) => updateSetting('formVoiceGuideEnabled', v)}
        />
        <ToggleRow
          id="a11y-prefer-text"
          label="Prefer text over voice"
          description="Nouri shows instructions as text instead of playing audio automatically."
          checked={!!settings.preferTextOverVoice}
          onChange={(v) => updateSetting('preferTextOverVoice', v)}
        />
        <ToggleRow
          id="a11y-simple-language"
          label="Simple language"
          description="Uses clearer spacing; Nouri will favor shorter phrases when this is on."
          checked={!!settings.simpleLanguage}
          onChange={(v) => updateSetting('simpleLanguage', v)}
        />
        <ToggleRow
          id="a11y-easy-mode"
          label="Easy mode"
          description="Larger controls and simpler layouts where supported."
          checked={!!settings.easyMode}
          onChange={(v) => updateSetting('easyMode', v)}
        />
        <ToggleRow
          id="a11y-list-first-find"
          label="List-first Find Food"
          description="Shows food listings first; map is optional (better for screen readers)."
          checked={!!settings.listFirstFind}
          onChange={(v) => updateSetting('listFirstFind', v)}
        />
        <ToggleRow
          id="a11y-screen-reader"
          label="Screen reader optimized"
          description="Clearer labels and fewer visual-only cues in Nouri replies."
          checked={!!settings.screenReaderOptimized}
          onChange={(v) => updateSetting('screenReaderOptimized', v)}
        />
      </div>

      <div className="nouri-a11y-footer">
        <button type="button" onClick={resetSettings} className="nouri-a11y-reset">
          Reset accessibility settings
        </button>
      </div>
    </div>
  );
}
