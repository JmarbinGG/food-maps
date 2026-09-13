/**
 * Re-export accessibility hooks from the unified Nouri guide context.
 * Keeps imports of AccessibilityContext working without a stub provider.
 */
export {
  NouriGuideProvider as AccessibilityProvider,
  useAccessibility,
  useNouriGuide,
} from './NouriGuideContext.jsx';
