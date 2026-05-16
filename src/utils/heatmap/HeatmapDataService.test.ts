import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { useOnlineHeatmapDataService } from './HeatmapDataService';

// Mock dependencies
jest.mock('@src/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthorized: true, ready: true }),
}));

const mockGet = jest.fn();
jest.mock('@src/modeles/ApiClientContext', () => ({
  useApiClient: () => ({ GET: mockGet }),
}));

describe('HeatmapDataService', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockGet.mockReset();

    // Provide a default empty return for the project API call to avoid it hanging or affecting tests
    mockGet.mockImplementation((url) => {
      if (url.includes('/projects/{id}')) {
        return Promise.resolve({ data: { is2D: false } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('getMapContent', () => {
    it('should return null when API client throws an error in try/catch block', async () => {
      // Mock the specific GET request to throw an error
      mockGet.mockImplementation((url) => {
        if (url.includes('/heatmap/map_data')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: { is2D: false } });
      });

      const { result } = renderHook(() => useOnlineHeatmapDataService(1, null, false), { wrapper });

      const res = await result.current.getMapContent('test-map');

      expect(res).toBeNull();
      expect(mockGet).toHaveBeenCalledWith('/api/v0/heatmap/map_data/{map_name}', expect.any(Object));
    });

    it('should return null when API client returns an error object in response', async () => {
      // Mock the GET request to return an error object
      mockGet.mockImplementation((url) => {
        if (url.includes('/heatmap/map_data')) {
          return Promise.resolve({ error: new Error('API returned error') });
        }
        return Promise.resolve({ data: { is2D: false } });
      });

      const { result } = renderHook(() => useOnlineHeatmapDataService(1, null, false), { wrapper });

      const res = await result.current.getMapContent('test-map');

      expect(res).toBeNull();
      expect(mockGet).toHaveBeenCalledWith('/api/v0/heatmap/map_data/{map_name}', expect.any(Object));
    });

    it('should return null when mapName is empty', async () => {
      const { result } = renderHook(() => useOnlineHeatmapDataService(1, null, false), { wrapper });

      // Clear mock calls from the initial render
      mockGet.mockClear();

      const res = await result.current.getMapContent('');

      expect(res).toBeNull();
      // Only check that map_data endpoint wasn't called, as project API might be called
      expect(mockGet).not.toHaveBeenCalledWith('/api/v0/heatmap/map_data/{map_name}', expect.any(Object));
    });
  });
});
