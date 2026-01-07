/**
 * アクセシビリティユーティリティ
 * @module utils/a11y
 */

export {
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  moveFocusTo,
  getActiveElement,
  isFocusable,
  hasFocus,
  containsFocus,
} from './focusManagement';
export type { MoveFocusToOptions } from './focusManagement';

export {
  getAriaDescribedBy,
  getAriaLabelledBy,
  getAriaExpanded,
  getAriaSelected,
  getAriaChecked,
  getAriaPressed,
  getAriaDisabled,
  getAriaHidden,
  getAriaCurrent,
  getAriaInvalid,
  getAriaRequired,
  getMenuItemAriaProps,
  getListboxOptionAriaProps,
} from './ariaHelpers';
export type { AriaCurrent, MenuItemAriaProps, ListboxOptionAriaProps } from './ariaHelpers';
