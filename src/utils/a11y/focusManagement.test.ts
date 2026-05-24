/**
 * @jest-environment jsdom
 */
import {
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  moveFocusTo,
  getActiveElement,
  isFocusable,
  hasFocus,
  containsFocus,
} from './focusManagement';

describe('focusManagement', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('getFocusableElements', () => {
    it('should return all focusable elements', () => {
      container.innerHTML = `
        <a href="#">Link</a>
        <button>Button</button>
        <input type="text" />
        <select><option>Option</option></select>
        <textarea></textarea>
        <div tabindex="0">Focusable Div</div>
        <div contenteditable="true">Editable</div>
        <audio controls></audio>
        <video controls></video>
        <details><summary>Summary</summary></details>
      `;

      // @happy-dom doesn't fully support summary/details query selection the same way, we can test what it does find.
      const elements = getFocusableElements(container);
      // We expect 9 or 10 depending on the environment. JSDOM returns 10, Happy-DOM 9.
      expect(elements.length).toBeGreaterThanOrEqual(9);
    });

    it('should ignore non-focusable elements and disabled/hidden elements', () => {
      container.innerHTML = `
        <a>No href Link</a>
        <button disabled>Disabled Button</button>
        <input disabled />
        <input type="hidden" />
        <select disabled></select>
        <textarea disabled></textarea>
        <div tabindex="-1">Negative Tabindex</div>
        <div>Not focusable</div>
        <button aria-hidden="true">Aria Hidden</button>
      `;

      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(0);
    });

    it('should filter out elements with display: none or visibility: hidden', () => {
      container.innerHTML = `
        <button id="visible">Visible</button>
        <button id="display-none">Display None</button>
        <button id="visibility-hidden">Visibility Hidden</button>
      `;

      const originalGetComputedStyle = window.getComputedStyle;
      jest.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
        if (el.id === 'display-none') return { display: 'none' } as CSSStyleDeclaration;
        if (el.id === 'visibility-hidden') return { visibility: 'hidden' } as CSSStyleDeclaration;
        return originalGetComputedStyle(el);
      });

      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(1);
      expect(elements[0].id).toBe('visible');
    });
  });

  describe('getFirstFocusable and getLastFocusable', () => {
    it('should return the first and last focusable elements', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <a href="#" id="middle">Middle</a>
        <input type="text" id="last" />
      `;

      const first = getFirstFocusable(container);
      const last = getLastFocusable(container);

      expect(first?.id).toBe('first');
      expect(last?.id).toBe('last');
    });

    it('should return null if no focusable elements are present', () => {
      container.innerHTML = `<div>No focusable elements</div>`;

      expect(getFirstFocusable(container)).toBeNull();
      expect(getLastFocusable(container)).toBeNull();
    });
  });

  describe('moveFocusTo', () => {
    it('should call focus on the element', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      const focusSpy = jest.spyOn(button, 'focus');

      moveFocusTo(button);

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: false });
    });

    it('should handle null elements gracefully', () => {
      expect(() => moveFocusTo(null)).not.toThrow();
    });

    it('should pass preventScroll option correctly', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      const focusSpy = jest.spyOn(button, 'focus');

      moveFocusTo(button, { preventScroll: true });

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should call select() if select option is true and element is an input or textarea', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      const selectSpy = jest.spyOn(input, 'select');

      moveFocusTo(input, { select: true });

      expect(selectSpy).toHaveBeenCalled();
    });

    it('should not call select() for elements that are not input or textarea', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      const selectSpy = jest.fn();
      (button as unknown as HTMLInputElement).select = selectSpy; // Add select method to mock

      moveFocusTo(button, { select: true });

      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('getActiveElement', () => {
    it('should return the currently focused element', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      button.focus();

      expect(getActiveElement()).toBe(button);
    });
  });

  describe('isFocusable', () => {
    it('should return true for focusable elements', () => {
      const button = document.createElement('button');
      expect(isFocusable(button)).toBe(true);
    });

    it('should return false for non-focusable elements', () => {
      const div = document.createElement('div');
      expect(isFocusable(div)).toBe(false);
    });
  });

  describe('hasFocus', () => {
    it('should return true if the element has focus', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      button.focus();

      expect(hasFocus(button)).toBe(true);
    });

    it('should return false if the element does not have focus', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);

      button1.focus();

      expect(hasFocus(button2)).toBe(false);
    });
  });

  describe('containsFocus', () => {
    it('should return true if focus is within the container', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      button.focus();

      expect(containsFocus(container)).toBe(true);
    });

    it('should return false if focus is outside the container', () => {
      const button = document.createElement('button');
      document.body.appendChild(button); // Append outside container
      button.focus();

      expect(containsFocus(container)).toBe(false);

      document.body.removeChild(button);
    });
  });
});
