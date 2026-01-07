import type { HintDefinition, HintId } from './types';

/**
 * Map of menu IDs to hint IDs
 */
export const menuHintMap: Record<string, HintId> = {
  general: 'menu-general',
  hotspot: 'menu-hotspot',
  eventlog: 'menu-eventlog',
  routecoach: 'menu-routecoach',
  timeline: 'menu-timeline',
  map: 'menu-map',
  fieldObject: 'menu-fieldObject',
  aggregation: 'menu-aggregation',
};

/**
 * All hint definitions
 */
export const hintDefinitions: HintDefinition[] = [
  {
    id: 'heatmap-welcome',
    trigger: { type: 'first-visit' },
    titleKey: 'hints.welcome.title',
    descriptionKey: 'hints.welcome.description',
    tipsKey: 'hints.welcome.tips',
  },
  {
    id: 'menu-general',
    trigger: { type: 'menu-open', menuId: 'general' },
    titleKey: 'hints.menuGeneral.title',
    descriptionKey: 'hints.menuGeneral.description',
    tipsKey: 'hints.menuGeneral.tips',
  },
  {
    id: 'menu-hotspot',
    trigger: { type: 'menu-open', menuId: 'hotspot' },
    titleKey: 'hints.menuHotspot.title',
    descriptionKey: 'hints.menuHotspot.description',
    tipsKey: 'hints.menuHotspot.tips',
  },
  {
    id: 'menu-eventlog',
    trigger: { type: 'menu-open', menuId: 'eventlog' },
    titleKey: 'hints.menuEventlog.title',
    descriptionKey: 'hints.menuEventlog.description',
    tipsKey: 'hints.menuEventlog.tips',
  },
  {
    id: 'menu-routecoach',
    trigger: { type: 'menu-open', menuId: 'routecoach' },
    titleKey: 'hints.menuRoutecoach.title',
    descriptionKey: 'hints.menuRoutecoach.description',
    tipsKey: 'hints.menuRoutecoach.tips',
  },
  {
    id: 'menu-timeline',
    trigger: { type: 'menu-open', menuId: 'timeline' },
    titleKey: 'hints.menuTimeline.title',
    descriptionKey: 'hints.menuTimeline.description',
    tipsKey: 'hints.menuTimeline.tips',
  },
  {
    id: 'menu-map',
    trigger: { type: 'menu-open', menuId: 'map' },
    titleKey: 'hints.menuMap.title',
    descriptionKey: 'hints.menuMap.description',
    tipsKey: 'hints.menuMap.tips',
  },
  {
    id: 'menu-fieldObject',
    trigger: { type: 'menu-open', menuId: 'fieldObject' },
    titleKey: 'hints.menuFieldObject.title',
    descriptionKey: 'hints.menuFieldObject.description',
    tipsKey: 'hints.menuFieldObject.tips',
  },
  {
    id: 'menu-aggregation',
    trigger: { type: 'menu-open', menuId: 'aggregation' },
    titleKey: 'hints.menuAggregation.title',
    descriptionKey: 'hints.menuAggregation.description',
    tipsKey: 'hints.menuAggregation.tips',
  },
];

/**
 * Get hint definition by ID
 */
export function getHintDefinition(id: HintId): HintDefinition | undefined {
  return hintDefinitions.find((hint) => hint.id === id);
}

/**
 * Get hint for menu open event
 */
export function getHintForMenu(menuId: string): HintDefinition | undefined {
  const hintId = menuHintMap[menuId];
  if (!hintId) return undefined;
  return getHintDefinition(hintId);
}

/**
 * Get the welcome hint (first visit)
 */
export function getWelcomeHint(): HintDefinition {
  return hintDefinitions.find((hint) => hint.id === 'heatmap-welcome')!;
}
