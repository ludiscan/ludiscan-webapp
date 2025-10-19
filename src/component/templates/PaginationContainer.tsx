import { useState, useMemo, useCallback } from 'react';

import type { FC, ReactNode } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Pagination } from '@src/component/molecules/Pagination';

/**
 * Pagination state that can be directly passed to useQuery params
 */
export type PaginationState = {
  limit: number;
  offset: number;
};

export type PaginationContainerProps = {
  children: (paginationState: PaginationState, currentPage: number) => ReactNode;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  showPaginationTop?: boolean;
  showPaginationBottom?: boolean;
  className?: string;
};

/**
 * PaginationContainer
 *
 * A template wrapper that manages pagination state and provides limit/offset to useQuery.
 *
 * Usage with createClient:
 * ```tsx
 * import { createClient } from '@src/modeles/qeury';
 *
 * <PaginationContainer
 *   totalItems={project.item_count}
 *   itemsPerPage={20}
 * >
 *   {(paginationState, currentPage) => {
 *     const { data: items = [], isLoading } = useQuery({
 *       queryKey: ['items', project.id, currentPage],
 *       queryFn: async () => {
 *         const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/items', {
 *           params: {
 *             query: paginationState,
 *             path: { project_id: project.id }
 *           }
 *         });
 *         if (error) return [];
 *         return data;
 *       },
 *     });
 *
 *     return (
 *       <>
 *         {items.map(item => <ItemRow key={item.id} item={item} />)}
 *       </>
 *     );
 *   }}
 * </PaginationContainer>
 * ```
 */
const Component: FC<PaginationContainerProps> = ({
  children,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showPaginationTop = false,
  showPaginationBottom = true,
  className,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [onPageChange],
  );

  // Create pagination state that can be passed directly to useQuery
  const paginationState = useMemo<PaginationState>(
    () => ({
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    }),
    [currentPage, itemsPerPage],
  );

  return (
    <FlexColumn gap={0} className={className}>
      {/* Top Pagination */}
      {showPaginationTop && <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />}

      {/* Content */}
      {children(paginationState, currentPage)}

      {/* Bottom Pagination */}
      {showPaginationBottom && <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />}
    </FlexColumn>
  );
};

export const PaginationContainer = Component;
