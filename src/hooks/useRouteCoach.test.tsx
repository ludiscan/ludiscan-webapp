/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { useRouteCoachSelect, useRouteCoachPatch, useSelectedClusterId } from './useRouteCoach';

import { store } from '@src/store';

describe('useRouteCoach hooks', () => {
  let appStore: ReturnType<typeof store>;

  beforeEach(() => {
    appStore = store();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={appStore}>{children}</Provider>
  );

  describe('useRouteCoachSelect', () => {
    it('should return the correct initial value', () => {
      const { result } = renderHook(() => useRouteCoachSelect((s) => s.selectedClusterId), { wrapper });
      expect(result.current).toBeNull();
    });
  });

  describe('useRouteCoachPatch', () => {
    it('should patch the route coach settings', () => {
      const { result } = renderHook(
        () => ({
          patch: useRouteCoachPatch(),
          selectedClusterId: useRouteCoachSelect((s) => s.selectedClusterId),
        }),
        { wrapper }
      );

      expect(result.current.selectedClusterId).toBeNull();

      act(() => {
        result.current.patch({ selectedClusterId: 10 });
      });

      expect(result.current.selectedClusterId).toBe(10);
    });
  });

  describe('useSelectedClusterId', () => {
    it('should return the selected cluster id', () => {
      const { result } = renderHook(() => useSelectedClusterId(), { wrapper });
      expect(result.current).toBeNull();

      act(() => {
        appStore.dispatch({
          type: 'routeCoach/patchRouteCoach',
          payload: { selectedClusterId: 42 },
        });
      });

      expect(result.current).toBe(42);
    });
  });
});
