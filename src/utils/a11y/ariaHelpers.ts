/**
 * ARIA属性ヘルパー
 * ARIA属性の生成を簡略化し、一貫性を保つ
 */

/**
 * 複数のIDを結合してaria-describedby用の文字列を生成
 * undefined や空文字列は除外される
 */
export function getAriaDescribedBy(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter((id): id is string => Boolean(id));
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * 複数のIDを結合してaria-labelledby用の文字列を生成
 */
export function getAriaLabelledBy(...ids: (string | undefined | null)[]): string | undefined {
  return getAriaDescribedBy(...ids);
}

/**
 * aria-expanded属性の値を取得
 */
export function getAriaExpanded(isExpanded: boolean): 'true' | 'false' {
  return isExpanded ? 'true' : 'false';
}

/**
 * aria-selected属性の値を取得
 */
export function getAriaSelected(isSelected: boolean): 'true' | 'false' {
  return isSelected ? 'true' : 'false';
}

/**
 * aria-checked属性の値を取得
 */
export function getAriaChecked(isChecked: boolean | 'mixed'): 'true' | 'false' | 'mixed' {
  if (isChecked === 'mixed') return 'mixed';
  return isChecked ? 'true' : 'false';
}

/**
 * aria-pressed属性の値を取得
 */
export function getAriaPressed(isPressed: boolean | 'mixed'): 'true' | 'false' | 'mixed' {
  if (isPressed === 'mixed') return 'mixed';
  return isPressed ? 'true' : 'false';
}

/**
 * aria-disabled属性の値を取得
 */
export function getAriaDisabled(isDisabled: boolean): 'true' | undefined {
  return isDisabled ? 'true' : undefined;
}

/**
 * aria-hidden属性の値を取得
 */
export function getAriaHidden(isHidden: boolean): 'true' | undefined {
  return isHidden ? 'true' : undefined;
}

/**
 * aria-current属性の値を取得
 */
export type AriaCurrent = 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';

export function getAriaCurrent(isCurrent: boolean, type: Exclude<AriaCurrent, 'true' | 'false'> = 'page'): AriaCurrent | undefined {
  return isCurrent ? type : undefined;
}

/**
 * aria-invalid属性の値を取得
 */
export function getAriaInvalid(isInvalid: boolean): 'true' | 'false' {
  return isInvalid ? 'true' : 'false';
}

/**
 * aria-required属性の値を取得
 */
export function getAriaRequired(isRequired: boolean): 'true' | undefined {
  return isRequired ? 'true' : undefined;
}

/**
 * role属性とそれに関連するARIA属性のセットを生成
 */
export interface MenuItemAriaProps {
  role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
  tabIndex: 0 | -1;
  'aria-checked'?: 'true' | 'false' | 'mixed';
  'aria-disabled'?: 'true';
}

export function getMenuItemAriaProps(options: {
  isActive: boolean;
  isChecked?: boolean | 'mixed';
  isDisabled?: boolean;
  type?: 'default' | 'checkbox' | 'radio';
}): MenuItemAriaProps {
  const { isActive, isChecked, isDisabled, type = 'default' } = options;

  const role: MenuItemAriaProps['role'] = type === 'checkbox' ? 'menuitemcheckbox' : type === 'radio' ? 'menuitemradio' : 'menuitem';

  return {
    role,
    tabIndex: isActive ? 0 : -1,
    ...(isChecked !== undefined && {
      'aria-checked': getAriaChecked(isChecked),
    }),
    ...(isDisabled && { 'aria-disabled': 'true' as const }),
  };
}

/**
 * listbox内のoptionのARIA属性を生成
 */
export interface ListboxOptionAriaProps {
  role: 'option';
  tabIndex: 0 | -1;
  'aria-selected': 'true' | 'false';
  'aria-disabled'?: 'true';
}

export function getListboxOptionAriaProps(options: { isActive: boolean; isSelected: boolean; isDisabled?: boolean }): ListboxOptionAriaProps {
  const { isActive, isSelected, isDisabled } = options;

  return {
    role: 'option',
    tabIndex: isActive ? 0 : -1,
    'aria-selected': getAriaSelected(isSelected),
    ...(isDisabled && { 'aria-disabled': 'true' as const }),
  };
}
