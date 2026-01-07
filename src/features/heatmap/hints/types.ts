/**
 * Hint system types for the heatmap viewer
 */

/**
 * Unique identifiers for each hint
 */
export type HintId =
  | 'heatmap-welcome'
  | 'menu-general'
  | 'menu-hotspot'
  | 'menu-eventlog'
  | 'menu-routecoach'
  | 'menu-timeline'
  | 'menu-map'
  | 'menu-fieldObject'
  | 'menu-aggregation';

/**
 * Trigger types for hints
 */
export type HintTrigger = { type: 'first-visit' } | { type: 'menu-open'; menuId: string };

/**
 * Hint definition structure
 */
export type HintDefinition = {
  id: HintId;
  trigger: HintTrigger;
  /** i18n key for title */
  titleKey: string;
  /** i18n key for description */
  descriptionKey: string;
  /** Optional i18n key for tips (array) */
  tipsKey?: string;
};

/**
 * State for hint system
 */
export type HintState = {
  currentHint: HintId | null;
  viewedHints: HintId[];
  disabledHints: HintId[];
};
