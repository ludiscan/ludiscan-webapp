import type { ThemeType } from '@src/modeles/theme';
import type { User } from '@src/modeles/user';

import { initializeValues, type HeatmapDataState } from '@src/modeles/heatmapView';
import {
  saveToken,
  getToken,
  saveUser,
  getUser,
  saveCanvasValues,
  getCanvasValues,
  saveCanvasPartial,
  loadCanvasPartial,
  saveThemeName,
  getThemeName,
  saveThemeType,
  getThemeType,
  saveRecentMenu,
  getRecentMenus,
  getViewedHints,
  markHintAsViewed,
  getDisabledHints,
  disableHint,
  shouldShowHint,
} from '@src/utils/localstrage';

const STORAGE_KEY = 'ludiscan';

describe('localstrage', () => {
  let mockStorage: Record<string, string> = {};

  beforeAll(() => {
    // Save original localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {};
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((key) => mockStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockStorage[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterAll(() => {
    // Restore original localStorage if necessary, or just clear
    jest.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  beforeEach(() => {
    mockStorage = {};
    jest.clearAllMocks();
  });

  describe('Token functions', () => {
    describe('saveToken', () => {
      test('should save a token to localStorage', () => {
        saveToken('my-token');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ token: 'my-token' })
        );
      });

      test('should preserve existing data when saving a token', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ otherData: 'value' });
        saveToken('my-token');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ otherData: 'value', token: 'my-token' })
        );
      });
    });

    describe('getToken', () => {
      test('should return null when there is no token in localStorage', () => {
        expect(getToken()).toBeNull();
      });

      test('should retrieve the token from localStorage', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ token: 'my-token' });
        expect(getToken()).toBe('my-token');
      });
    });
  });

  describe('User functions', () => {
    const mockUser = { id: 1, name: 'Test User' } as unknown as User;

    describe('saveUser', () => {
      test('should save a user to localStorage', () => {
        saveUser(mockUser);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ user: mockUser })
        );
      });

      test('should preserve existing data when saving a user', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ token: 'my-token' });
        saveUser(mockUser);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ token: 'my-token', user: mockUser })
        );
      });
    });

    describe('getUser', () => {
      test('should return null when there is no user in localStorage', () => {
        expect(getUser()).toBeNull();
      });

      test('should retrieve the user from localStorage', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ user: mockUser });
        expect(getUser()).toEqual(mockUser);
      });
    });
  });

  describe('Canvas functions', () => {
    const mockCanvasValues: HeatmapDataState = {
      ...initializeValues,
      version: '1.0',
    } as unknown as HeatmapDataState; // Using unknown as to avoid importing full HeatmapDataState structure if not needed, but initializeValues is enough

    describe('saveCanvasValues', () => {
      test('should save canvas values to localStorage', () => {
        saveCanvasValues(mockCanvasValues);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ canvas: mockCanvasValues })
        );
      });

      test('should preserve existing data when saving canvas values', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ token: 'my-token' });
        saveCanvasValues(mockCanvasValues);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ token: 'my-token', canvas: mockCanvasValues })
        );
      });
    });

    describe('getCanvasValues', () => {
      test('should return null when there are no canvas values in localStorage', () => {
        expect(getCanvasValues()).toBeNull();
      });

      test('should retrieve the canvas values from localStorage', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ canvas: mockCanvasValues });
        expect(getCanvasValues()).toEqual(mockCanvasValues);
      });
    });

    describe('saveCanvasPartial', () => {
      test('should update a specific canvas property when storage is empty using initializeValues', () => {
        saveCanvasPartial('version', '2.0');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ ...initializeValues, version: '2.0' })
        );
      });

      test('should update a specific canvas property when storage exists', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ canvas: { ...initializeValues, version: '1.0' } });
        saveCanvasPartial('version', '2.0');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ ...initializeValues, version: '2.0' })
        );
      });
    });

    describe('loadCanvasPartial', () => {
      test('should throw an error when no data exists', () => {
        expect(() => loadCanvasPartial('version')).toThrow('No data for key: version');
      });

      test('should return the specific canvas property when data exists', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ canvas: { ...initializeValues, version: '2.0' } });
        expect(loadCanvasPartial('version')).toBe('2.0');
      });
    });
  });

  describe('Theme functions', () => {
    describe('saveThemeName', () => {
      test('should save a theme name to localStorage', () => {
        saveThemeName('dark');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ theme: 'dark' })
        );
      });

      test('should preserve existing data when saving a theme name', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ token: 'my-token' });
        saveThemeName('light');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ token: 'my-token', theme: 'light' })
        );
      });
    });

    describe('getThemeName', () => {
      test('should return null when there is no theme name in localStorage', () => {
        expect(getThemeName()).toBeNull();
      });

      test('should retrieve the theme name from localStorage', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ theme: 'dark' });
        expect(getThemeName()).toBe('dark');
      });
    });

    describe('saveThemeType', () => {
      test('should save a theme type to localStorage', () => {
        const themeType = { palette: { primary: '#000' } } as unknown as ThemeType;
        saveThemeType(themeType);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ themeType })
        );
      });

      test('should preserve existing data when saving a theme type', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ token: 'my-token' });
        const themeType = { palette: { primary: '#fff' } } as unknown as ThemeType;
        saveThemeType(themeType);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ token: 'my-token', themeType })
        );
      });
    });

    describe('getThemeType', () => {
      test('should return null when there is no theme type in localStorage', () => {
        expect(getThemeType()).toBeNull();
      });

      test('should retrieve the theme type from localStorage', () => {
        const themeType = { palette: { primary: '#000' } } as unknown as ThemeType;
        mockStorage[STORAGE_KEY] = JSON.stringify({ themeType });
        expect(getThemeType()).toEqual(themeType);
      });
    });
  });

  describe('Menu and Hint functions', () => {
    describe('saveRecentMenu and getRecentMenus', () => {
      test('should return an empty array when there are no recent menus', () => {
        expect(getRecentMenus()).toEqual([]);
      });

      test('should save a recent menu to localStorage', () => {
        saveRecentMenu('menu1');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ recentMenus: ['menu1'] })
        );
      });

      test('should preserve existing data and remove duplicates, keeping max 5 items', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ recentMenus: ['menu1', 'menu2', 'menu3', 'menu4', 'menu5'] });
        saveRecentMenu('menu2'); // duplicate, should move to front
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ recentMenus: ['menu2', 'menu1', 'menu3', 'menu4', 'menu5'] })
        );

        saveRecentMenu('menu6'); // new, should evict last
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ recentMenus: ['menu6', 'menu2', 'menu1', 'menu3', 'menu4'] })
        );
      });

      test('should retrieve recent menus from localStorage', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ recentMenus: ['menu1', 'menu2'] });
        expect(getRecentMenus()).toEqual(['menu1', 'menu2']);
      });
    });

    describe('Hint functions', () => {
      test('getViewedHints should return empty array by default', () => {
        expect(getViewedHints()).toEqual([]);
      });

      test('markHintAsViewed should save a hint to viewedHints', () => {
        markHintAsViewed('hint1');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ viewedHints: ['hint1'] })
        );
      });

      test('markHintAsViewed should not save duplicate hints', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ viewedHints: ['hint1'] });
        markHintAsViewed('hint1');
        expect(localStorage.setItem).not.toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ viewedHints: ['hint1', 'hint1'] })
        );
      });

      test('getViewedHints should retrieve viewed hints', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ viewedHints: ['hint1', 'hint2'] });
        expect(getViewedHints()).toEqual(['hint1', 'hint2']);
      });

      test('getDisabledHints should return empty array by default', () => {
        expect(getDisabledHints()).toEqual([]);
      });

      test('disableHint should save a hint to disabledHints', () => {
        disableHint('hint1');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ disabledHints: ['hint1'] })
        );
      });

      test('disableHint should not save duplicate hints', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ disabledHints: ['hint1'] });
        disableHint('hint1');
        expect(localStorage.setItem).not.toHaveBeenCalledWith(
          STORAGE_KEY,
          JSON.stringify({ disabledHints: ['hint1', 'hint1'] })
        );
      });

      test('getDisabledHints should retrieve disabled hints', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ disabledHints: ['hint1', 'hint2'] });
        expect(getDisabledHints()).toEqual(['hint1', 'hint2']);
      });

      test('shouldShowHint should return true when hint is neither viewed nor disabled', () => {
        expect(shouldShowHint('hint1')).toBe(true);
      });

      test('shouldShowHint should return false when hint is viewed', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ viewedHints: ['hint1'] });
        expect(shouldShowHint('hint1')).toBe(false);
      });

      test('shouldShowHint should return false when hint is disabled', () => {
        mockStorage[STORAGE_KEY] = JSON.stringify({ disabledHints: ['hint1'] });
        expect(shouldShowHint('hint1')).toBe(false);
      });
    });
  });
});
