/**
 * フォーカス管理ユーティリティ
 * モーダル、ダイアログ、フォーカストラップなどのフォーカス管理を支援
 */

/** フォーカス可能な要素のセレクタ */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
].join(', ');

/**
 * コンテナ内のフォーカス可能な要素を取得
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    // display: none や visibility: hidden の要素を除外
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    // aria-hidden="true" の要素を除外
    if (el.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    return true;
  });
}

/**
 * コンテナ内の最初のフォーカス可能要素を取得
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] ?? null;
}

/**
 * コンテナ内の最後のフォーカス可能要素を取得
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
}

export interface MoveFocusToOptions {
  /** スクロールを防ぐ */
  preventScroll?: boolean;
  /** フォーカス後にテキストを選択 */
  select?: boolean;
}

/**
 * 指定した要素にフォーカスを移動
 */
export function moveFocusTo(element: HTMLElement | null, options: MoveFocusToOptions = {}): void {
  if (!element) return;

  const { preventScroll = false, select = false } = options;

  element.focus({ preventScroll });

  if (select && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    element.select();
  }
}

/**
 * 現在フォーカスされている要素を取得
 */
export function getActiveElement(): Element | null {
  return document.activeElement;
}

/**
 * 要素がフォーカス可能かどうかを判定
 */
export function isFocusable(element: HTMLElement): boolean {
  return element.matches(FOCUSABLE_SELECTOR);
}

/**
 * 要素が現在フォーカスを持っているか判定
 */
export function hasFocus(element: HTMLElement): boolean {
  return document.activeElement === element;
}

/**
 * コンテナ内にフォーカスがあるかどうかを判定
 */
export function containsFocus(container: HTMLElement): boolean {
  return container.contains(document.activeElement);
}
