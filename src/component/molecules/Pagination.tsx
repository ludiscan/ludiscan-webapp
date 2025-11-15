import styled from '@emotion/styled';
import { useMemo } from 'react';
import { BiChevronLeft, BiChevronRight, BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

/**
 * Pagination component - Standard pagination controls
 *
 * Usage with createClient:
 * ```tsx
 * import { useState } from 'react';
 * import { useQuery } from '@tanstack/react-query';
 * import { Pagination } from '@src/component/molecules/Pagination';
 * import { createClient } from '@src/modeles/qeury';
 *
 * const [currentPage, setCurrentPage] = useState(1);
 * const itemsPerPage = 20;
 *
 * const { data: items = [] } = useQuery({
 *   queryKey: ['items', project.id, currentPage],
 *   queryFn: async () => {
 *     const offset = (currentPage - 1) * itemsPerPage;
 *     const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/items', {
 *       params: {
 *         query: { limit: itemsPerPage, offset },
 *         path: { project_id: project.id }
 *       }
 *     });
 *     if (error) return [];
 *     return data;
 *   },
 * });
 *
 * return (
 *   <>
 *     {items.map(item => <ItemRow key={item.id} item={item} />)}
 *     <Pagination
 *       currentPage={currentPage}
 *       totalItems={project.item_count}
 *       itemsPerPage={itemsPerPage}
 *       onPageChange={setCurrentPage}
 *     />
 *   </>
 * );
 * ```
 */
export type PaginationProps = {
  className?: string;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
};

const Component: FC<PaginationProps> = ({ className, currentPage, totalItems, itemsPerPage, onPageChange, maxVisiblePages = 5 }) => {
  const { theme } = useSharedTheme();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Calculate visible page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const halfWindow = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(2, currentPage - halfWindow);
      let endPage = Math.min(totalPages - 1, currentPage + halfWindow);

      // Adjust range to always show maxVisiblePages items
      if (currentPage - halfWindow <= 2) {
        endPage = Math.min(totalPages - 1, endPage + (2 - (currentPage - halfWindow)));
      }
      if (currentPage + halfWindow >= totalPages - 1) {
        startPage = Math.max(2, startPage - (currentPage + halfWindow - (totalPages - 1)));
      }

      // Add ellipsis and pages
      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage, maxVisiblePages]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={className}>
      <FlexRow gap={8} align={'center'} className={`${className}__controls`}>
        {/* First Page Button */}
        <Button
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          scheme='surface'
          fontSize={'sm'}
          className={`${className}__navButton`}
          title='最初のページへ'
        >
          <BiChevronsLeft size={18} />
        </Button>

        {/* Previous Page Button */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          scheme='surface'
          fontSize={'sm'}
          className={`${className}__navButton`}
          title='前のページへ'
        >
          <BiChevronLeft size={18} />
        </Button>

        {/* Page Numbers */}
        <FlexRow gap={4} align={'center'}>
          {pageNumbers.map((page, index) => (
            <button
              key={`${page}-${index}`}
              className={`${className}__pageButton ${page === currentPage ? `${className}__pageButton--active` : ''} ${
                page === '...' ? `${className}__pageButton--ellipsis` : ''
              }`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              title={typeof page === 'number' ? `ページ ${page}` : undefined}
            >
              {page}
            </button>
          ))}
        </FlexRow>

        {/* Next Page Button */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          scheme='surface'
          fontSize={'sm'}
          className={`${className}__navButton`}
          title='次のページへ'
        >
          <BiChevronRight size={18} />
        </Button>

        {/* Last Page Button */}
        <Button
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          scheme='surface'
          fontSize={'sm'}
          className={`${className}__navButton`}
          title='最後のページへ'
        >
          <BiChevronsRight size={18} />
        </Button>
      </FlexRow>

      {/* Info Text */}
      <Text text={`${startItem}–${endItem} / ${totalItems}件`} fontSize={'xs'} color={theme.colors.text.secondary} className={`${className}__info`} />
    </div>
  );
};

export const Pagination = styled(Component)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};

  &__controls {
    justify-content: center;
  }

  &__navButton {
    min-width: 44px;
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  &__pageButton {
    min-width: 44px;
    min-height: 44px;
    padding: 0 ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.surface.sunken};
    border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surface.hover};
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &--active {
      color: ${({ theme }) => theme.colors.primary.contrast};
      cursor: default;
      background-color: ${({ theme }) => theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main};

      &:hover {
        background-color: ${({ theme }) => theme.colors.primary.main};
        border-color: ${({ theme }) => theme.colors.primary.main};
      }
    }

    &--ellipsis {
      padding: 0 ${({ theme }) => theme.spacing.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
      cursor: default;
      background-color: transparent;
      border: none;

      &:hover {
        background-color: transparent;
        border: none;
      }
    }
  }

  &__info {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    text-align: center;
  }
`;
