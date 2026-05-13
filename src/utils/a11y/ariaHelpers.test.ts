import {
  getAriaDescribedBy,
  getAriaLabelledBy,
  getAriaExpanded,
  getAriaSelected,
  getAriaDisabled,
  getAriaHidden,
  getAriaInvalid,
  getAriaRequired,
  getAriaChecked,
  getAriaPressed,
  getAriaCurrent,
  getMenuItemAriaProps,
  getListboxOptionAriaProps
} from './ariaHelpers';

describe('ariaHelpers', () => {
  describe('getAriaDescribedBy', () => {
    test('should return joined IDs when valid IDs are provided', () => {
      expect(getAriaDescribedBy('id1', 'id2')).toBe('id1 id2');
      expect(getAriaDescribedBy('error-msg', 'help-text')).toBe('error-msg help-text');
    });

    test('should ignore undefined, null, and empty strings', () => {
      expect(getAriaDescribedBy('id1', undefined, 'id2', null, '', 'id3')).toBe('id1 id2 id3');
      expect(getAriaDescribedBy(undefined, null, '')).toBeUndefined();
    });

    test('should return undefined when no valid IDs are provided', () => {
      expect(getAriaDescribedBy()).toBeUndefined();
      expect(getAriaDescribedBy(undefined)).toBeUndefined();
      expect(getAriaDescribedBy(null)).toBeUndefined();
      expect(getAriaDescribedBy('')).toBeUndefined();
    });
  });

  describe('getAriaLabelledBy', () => {
    test('should return joined IDs when valid IDs are provided', () => {
      expect(getAriaLabelledBy('id1', 'id2')).toBe('id1 id2');
      expect(getAriaLabelledBy('label1', 'label2')).toBe('label1 label2');
    });

    test('should ignore undefined, null, and empty strings', () => {
      expect(getAriaLabelledBy('id1', undefined, 'id2', null, '', 'id3')).toBe('id1 id2 id3');
      expect(getAriaLabelledBy(undefined, null, '')).toBeUndefined();
    });

    test('should return undefined when no valid IDs are provided', () => {
      expect(getAriaLabelledBy()).toBeUndefined();
      expect(getAriaLabelledBy(undefined)).toBeUndefined();
      expect(getAriaLabelledBy(null)).toBeUndefined();
      expect(getAriaLabelledBy('')).toBeUndefined();
    });
  });

  describe('getAriaExpanded', () => {
    test('should return "true" when isExpanded is true', () => {
      expect(getAriaExpanded(true)).toBe('true');
    });

    test('should return "false" when isExpanded is false', () => {
      expect(getAriaExpanded(false)).toBe('false');
    });
  });

  describe('getAriaSelected', () => {
    test('should return "true" when isSelected is true', () => {
      expect(getAriaSelected(true)).toBe('true');
    });

    test('should return "false" when isSelected is false', () => {
      expect(getAriaSelected(false)).toBe('false');
    });
  });

  describe('getAriaDisabled', () => {
    test('should return "true" when isDisabled is true', () => {
      expect(getAriaDisabled(true)).toBe('true');
    });

    test('should return undefined when isDisabled is false', () => {
      expect(getAriaDisabled(false)).toBeUndefined();
    });
  });

  describe('getAriaHidden', () => {
    test('should return "true" when isHidden is true', () => {
      expect(getAriaHidden(true)).toBe('true');
    });

    test('should return undefined when isHidden is false', () => {
      expect(getAriaHidden(false)).toBeUndefined();
    });
  });

  describe('getAriaInvalid', () => {
    test('should return "true" when isInvalid is true', () => {
      expect(getAriaInvalid(true)).toBe('true');
    });

    test('should return "false" when isInvalid is false', () => {
      expect(getAriaInvalid(false)).toBe('false');
    });
  });

  describe('getAriaRequired', () => {
    test('should return "true" when isRequired is true', () => {
      expect(getAriaRequired(true)).toBe('true');
    });

    test('should return undefined when isRequired is false', () => {
      expect(getAriaRequired(false)).toBeUndefined();
    });
  });

  describe('getAriaChecked', () => {
    test('should return "true" when isChecked is true', () => {
      expect(getAriaChecked(true)).toBe('true');
    });

    test('should return "false" when isChecked is false', () => {
      expect(getAriaChecked(false)).toBe('false');
    });

    test('should return "mixed" when isChecked is "mixed"', () => {
      expect(getAriaChecked('mixed')).toBe('mixed');
    });
  });

  describe('getAriaPressed', () => {
    test('should return "true" when isPressed is true', () => {
      expect(getAriaPressed(true)).toBe('true');
    });

    test('should return "false" when isPressed is false', () => {
      expect(getAriaPressed(false)).toBe('false');
    });

    test('should return "mixed" when isPressed is "mixed"', () => {
      expect(getAriaPressed('mixed')).toBe('mixed');
    });
  });

  describe('getAriaCurrent', () => {
    test('should return "page" by default when isCurrent is true', () => {
      expect(getAriaCurrent(true)).toBe('page');
    });

    test('should return the specified type when isCurrent is true', () => {
      expect(getAriaCurrent(true, 'step')).toBe('step');
      expect(getAriaCurrent(true, 'location')).toBe('location');
      expect(getAriaCurrent(true, 'date')).toBe('date');
      expect(getAriaCurrent(true, 'time')).toBe('time');
    });

    test('should return undefined when isCurrent is false', () => {
      expect(getAriaCurrent(false)).toBeUndefined();
      expect(getAriaCurrent(false, 'step')).toBeUndefined();
    });
  });

  describe('getMenuItemAriaProps', () => {
    test('should return default props when only isActive is provided', () => {
      expect(getMenuItemAriaProps({ isActive: true })).toEqual({
        role: 'menuitem',
        tabIndex: 0,
      });

      expect(getMenuItemAriaProps({ isActive: false })).toEqual({
        role: 'menuitem',
        tabIndex: -1,
      });
    });

    test('should set role based on type', () => {
      expect(getMenuItemAriaProps({ isActive: true, type: 'checkbox' }).role).toBe('menuitemcheckbox');
      expect(getMenuItemAriaProps({ isActive: true, type: 'radio' }).role).toBe('menuitemradio');
      expect(getMenuItemAriaProps({ isActive: true, type: 'default' }).role).toBe('menuitem');
    });

    test('should set aria-checked when isChecked is provided', () => {
      expect(getMenuItemAriaProps({ isActive: true, isChecked: true })['aria-checked']).toBe('true');
      expect(getMenuItemAriaProps({ isActive: true, isChecked: false })['aria-checked']).toBe('false');
      expect(getMenuItemAriaProps({ isActive: true, isChecked: 'mixed' })['aria-checked']).toBe('mixed');
    });

    test('should set aria-disabled when isDisabled is true', () => {
      expect(getMenuItemAriaProps({ isActive: true, isDisabled: true })['aria-disabled']).toBe('true');
      expect(getMenuItemAriaProps({ isActive: true, isDisabled: false })['aria-disabled']).toBeUndefined();
    });
  });

  describe('getListboxOptionAriaProps', () => {
    test('should return base props correctly', () => {
      expect(getListboxOptionAriaProps({ isActive: true, isSelected: true })).toEqual({
        role: 'option',
        tabIndex: 0,
        'aria-selected': 'true',
      });

      expect(getListboxOptionAriaProps({ isActive: false, isSelected: false })).toEqual({
        role: 'option',
        tabIndex: -1,
        'aria-selected': 'false',
      });
    });

    test('should set aria-disabled when isDisabled is true', () => {
      expect(getListboxOptionAriaProps({ isActive: true, isSelected: true, isDisabled: true })['aria-disabled']).toBe('true');
      expect(getListboxOptionAriaProps({ isActive: true, isSelected: true, isDisabled: false })['aria-disabled']).toBeUndefined();
    });
  });
});
