import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';

import type { components } from '@generated/api';

import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';

export type FilterOptions = components['schemas']['FilterOptionsResponseDto'];
export type MetadataKeysResponse = components['schemas']['MetadataKeysResponseDto'];
export type MetadataKeyInfo = components['schemas']['MetadataKeyInfoDto'];
export type AggregateResponse = components['schemas']['AggregatePlaySessionResponseDto'];
export type FieldAggregationResult = components['schemas']['FieldAggregationResultDto'];
export type AggregationField = components['schemas']['AggregationFieldDto'];
export type AggregationOperation = 'count' | 'sum' | 'avg' | 'min' | 'max';

export type SessionFilterState = {
  platform?: string;
  appVersion?: string;
  deviceId?: string;
  isPlaying?: boolean;
  startTimeFrom?: string;
  startTimeTo?: string;
  metadataKey?: string;
  metadataValue?: string;
  q?: string;
};

export type AggregationConfig = {
  field: string;
  operations: AggregationOperation[];
};

/**
 * Hook to fetch filter options (platforms, app versions, device IDs)
 */
export const useFilterOptions = (projectId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['filterOptions', projectId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/filter-options', {
        params: {
          path: { project_id: projectId },
        },
      });
      if (error) throw new Error('Failed to fetch filter options');
      return data;
    },
    enabled: projectId > 0,
    staleTime: DefaultStaleTime,
  });
};

/**
 * Hook to fetch metadata keys used in sessions
 */
export const useMetadataKeys = (projectId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['metadataKeys', projectId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/metadata-keys', {
        params: {
          path: { project_id: projectId },
        },
      });
      if (error) throw new Error('Failed to fetch metadata keys');
      return data;
    },
    enabled: projectId > 0,
    staleTime: DefaultStaleTime,
  });
};

/**
 * Hook to aggregate sessions with filters
 */
export const useSessionAggregate = (projectId: number) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      filters,
      aggregations,
    }: {
      filters: SessionFilterState;
      aggregations?: AggregationConfig[];
    }) => {
      const { data, error } = await apiClient.POST('/api/v0.1/projects/{project_id}/sessions/aggregate', {
        params: {
          path: { project_id: projectId },
        },
        body: {
          platform: filters.platform || undefined,
          app_version: filters.appVersion || undefined,
          device_id: filters.deviceId || undefined,
          is_playing: filters.isPlaying,
          start_time_from: filters.startTimeFrom || undefined,
          start_time_to: filters.startTimeTo || undefined,
          metadata_key: filters.metadataKey || undefined,
          metadata_value: filters.metadataValue || undefined,
          q: filters.q || undefined,
          aggregations: aggregations?.map((a) => ({
            field: a.field,
            operations: a.operations,
          })),
        },
      });
      if (error) throw new Error('Failed to aggregate sessions');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionAggregate', projectId] });
    },
  });

  return mutation;
};

/**
 * Combined hook for session filters and aggregation
 */
export const useSessionFiltersAndAggregate = (projectId: number) => {
  const [filters, setFilters] = useState<SessionFilterState>({});
  const [aggregationConfigs, setAggregationConfigs] = useState<AggregationConfig[]>([]);

  const filterOptionsQuery = useFilterOptions(projectId);
  const metadataKeysQuery = useMetadataKeys(projectId);
  const aggregateMutation = useSessionAggregate(projectId);

  const updateFilter = useCallback(<K extends keyof SessionFilterState>(key: K, value: SessionFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const addAggregation = useCallback((field: string, operations: AggregationOperation[] = ['count', 'sum', 'avg', 'min', 'max']) => {
    setAggregationConfigs((prev) => {
      const existing = prev.find((a) => a.field === field);
      if (existing) return prev;
      return [...prev, { field, operations }];
    });
  }, []);

  const removeAggregation = useCallback((field: string) => {
    setAggregationConfigs((prev) => prev.filter((a) => a.field !== field));
  }, []);

  const clearAggregations = useCallback(() => {
    setAggregationConfigs([]);
  }, []);

  const runAggregate = useCallback(async () => {
    return aggregateMutation.mutateAsync({
      filters,
      aggregations: aggregationConfigs.length > 0 ? aggregationConfigs : undefined,
    });
  }, [aggregateMutation, filters, aggregationConfigs]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== undefined && v !== '');
  }, [filters]);

  const numericMetadataKeys = useMemo(() => {
    return metadataKeysQuery.data?.keys.filter((k) => k.isNumeric) ?? [];
  }, [metadataKeysQuery.data]);

  return {
    // Filter state
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,

    // Filter options data
    filterOptions: filterOptionsQuery.data,
    isLoadingFilterOptions: filterOptionsQuery.isLoading,

    // Metadata keys data
    metadataKeys: metadataKeysQuery.data?.keys ?? [],
    numericMetadataKeys,
    isLoadingMetadataKeys: metadataKeysQuery.isLoading,

    // Aggregation config
    aggregationConfigs,
    addAggregation,
    removeAggregation,
    clearAggregations,

    // Aggregation execution
    runAggregate,
    aggregateResult: aggregateMutation.data,
    isAggregating: aggregateMutation.isPending,
    aggregateError: aggregateMutation.error,
  };
};
