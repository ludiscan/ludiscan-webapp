import { saveCanvasPartial } from './localstrage';

import { initializeValues } from '@src/modeles/heatmapView';

const STORAGE_KEY = 'ludiscan';

describe('saveCanvasPartial', () => {
  let getItemMock: jest.Mock;
  let setItemMock: jest.Mock;

  beforeEach(() => {
    getItemMock = jest.fn();
    setItemMock = jest.fn();

    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: getItemMock,
        setItem: setItemMock,
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should merge partial update with existing canvas state', () => {
    // Add window object so that getCanvasValues/saveCanvasPartial SSR checks pass
    Object.defineProperty(global, 'window', { value: {}, writable: true });

    const mockState = {
      ...initializeValues,
      general: {
        ...initializeValues.general,
        showHeatmap: false,
      },
    };

    // Return the state wrapped in a top-level object to simulate full local storage content
    const existingStorageData = { otherKey: 'value', canvas: mockState };
    getItemMock.mockReturnValue(JSON.stringify(existingStorageData));

    const newGeneralState = {
      ...mockState.general,
      showHeatmap: true,
      heatmapOpacity: 0.5,
    };

    saveCanvasPartial('general', newGeneralState);

    expect(getItemMock).toHaveBeenCalledWith(STORAGE_KEY);

    const expectedStoredData = {
      ...existingStorageData,
      canvas: {
        ...mockState,
        general: newGeneralState,
      }
    };

    expect(setItemMock).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(expectedStoredData)
    );
  });

  test('should fallback to empty object when localStorage is empty', () => {
    // Add window object so that getCanvasValues/saveCanvasPartial SSR checks pass
    Object.defineProperty(global, 'window', { value: {}, writable: true });

    getItemMock.mockReturnValue(null);

    const newHotspotMode = {
      ...initializeValues.hotspotMode,
      visible: true,
    };

    saveCanvasPartial('hotspotMode', newHotspotMode);

    expect(getItemMock).toHaveBeenCalledWith(STORAGE_KEY);

    const expectedStoredData = {
      canvas: {
        hotspotMode: newHotspotMode,
      }
    };

    expect(setItemMock).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(expectedStoredData)
    );
  });

  test('should return early without throwing in SSR environment', () => {
    // We cannot easily delete global.window if it was defined non-configurable
    // Let's redefine it as undefined
    const originalWindow = global.window;

    try {
        Object.defineProperty(global, 'window', { value: undefined, writable: true });
    } catch {
        // Fallback for Bun test runner which might have strict globals
        // @ts-expect-error Bun globals fallback
        global.window = undefined;
    }

    expect(() => saveCanvasPartial('general', initializeValues.general)).not.toThrow();

    expect(getItemMock).not.toHaveBeenCalled();
    expect(setItemMock).not.toHaveBeenCalled();

    try {
        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
    } catch {
        // @ts-expect-error Bun globals fallback
        global.window = originalWindow;
    }
  });
});
