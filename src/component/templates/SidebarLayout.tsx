import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BiHome, BiUser, BiKey, BiLock, BiBook, BiChevronDown, BiChevronRight } from 'react-icons/bi';

import type { DocGroup } from '@src/utils/docs/types';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SidebarLayoutProps = {
  className?: string | undefined;
};

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  isDropdown?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', href: '/home', icon: <BiHome size={20} />, requiresAuth: true },
  { label: 'Profile', href: '/profile', icon: <BiUser size={20} />, requiresAuth: true },
  { label: 'API Keys', href: '/api-keys', icon: <BiKey size={20} />, requiresAuth: true },
  { label: 'Security', href: '/security', icon: <BiLock size={20} />, requiresAuth: true },
  { label: 'Docs', icon: <BiBook size={20} />, requiresAuth: true, isDropdown: true },
];

const Component: FC<SidebarLayoutProps> = ({ className }) => {
  const pathname = usePathname();
  const { theme } = useSharedTheme();
  const { isAuthorized } = useAuth();
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());

  // Fetch docs groups for the dropdown
  const { data: docsGroups = [] } = useQuery<DocGroup[]>({
    queryKey: ['docs-groups'],
    queryFn: async () => {
      const response = await fetch('/api/docs/groups');
      if (!response.ok) {
        throw new Error('Failed to fetch docs groups');
      }
      return response.json();
    },
    enabled: isAuthorized,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const toggleDropdown = (label: string) => {
    const next = new Set(expandedDropdowns);
    if (next.has(label)) {
      next.delete(label);
    } else {
      next.add(label);
    }
    setExpandedDropdowns(next);
  };

  const visibleItems = MENU_ITEMS.filter((item) => !item.requiresAuth || isAuthorized);

  // Check if any docs page is active
  const isDocsActive = pathname?.startsWith('/heatmap/docs');

  return (
    <ResponsiveSidebar>
      <div className={className}>
        <FlexColumn gap={8}>
          {visibleItems.map((item) => {
            // Render dropdown menu item
            if (item.isDropdown && item.label === 'Docs') {
              const isExpanded = expandedDropdowns.has(item.label);
              return (
                <div key={item.label}>
                  <button className={`${className}__menuItem ${isDocsActive ? 'active' : ''}`} onClick={() => toggleDropdown(item.label)} type='button'>
                    <FlexRow gap={12} align={'center'} className={`${className}__menuContent`}>
                      <div className={`${className}__menuIcon`}>{item.icon}</div>
                      <Text
                        text={item.label}
                        fontSize={theme.typography.fontSize.base}
                        fontWeight={theme.typography.fontWeight.bold}
                        color={theme.colors.text.primary}
                      />
                      <div className={`${className}__chevron`}>{isExpanded ? <BiChevronDown size={18} /> : <BiChevronRight size={18} />}</div>
                    </FlexRow>
                  </button>

                  {/* Dropdown content */}
                  {isExpanded && (
                    <div className={`${className}__dropdown`}>
                      {docsGroups.map((group) => (
                        <div key={group.name} className={`${className}__dropdownGroup`}>
                          <div className={`${className}__dropdownGroupTitle`}>
                            <Text
                              text={group.name}
                              fontSize={theme.typography.fontSize.sm}
                              fontWeight={theme.typography.fontWeight.bold}
                              color={theme.colors.text.tertiary}
                            />
                          </div>
                          {group.items.map((doc) => (
                            <Link key={doc.slug} href={`/heatmap/docs/${doc.slug}`}>
                              <div className={`${className}__dropdownItem ${isActive(`/heatmap/docs/${doc.slug}`) ? 'active' : ''}`}>
                                <Text
                                  text={doc.frontmatter.title}
                                  fontSize={theme.typography.fontSize.sm}
                                  fontWeight={isActive(`/heatmap/docs/${doc.slug}`) ? theme.typography.fontWeight.bold : theme.typography.fontWeight.medium}
                                  color={theme.colors.text.primary}
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Render regular menu item
            if (!item.href) return null;

            return (
              <Link key={item.href} href={item.href}>
                <div className={`${className}__menuItem ${isActive(item.href) ? 'active' : ''}`}>
                  <FlexRow gap={12} align={'center'} className={`${className}__menuContent`}>
                    <div className={`${className}__menuIcon`}>{item.icon}</div>
                    <Text
                      text={item.label}
                      fontSize={theme.typography.fontSize.base}
                      fontWeight={theme.typography.fontWeight.semibold}
                      color={theme.colors.text.primary}
                    />
                  </FlexRow>
                </div>
              </Link>
            );
          })}
        </FlexColumn>
      </div>
    </ResponsiveSidebar>
  );
};

export const SidebarLayout = styled(Component)`
  display: flex;

  &__menuItem {
    width: 100%;
    padding: 12px 8px;
    text-align: left;
    cursor: pointer;
    background-color: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.hover};
    }

    &.active {
      /* Text color in active menu item */
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.surface.interactive};
    }
  }

  &__menuContent {
    width: 100%;
  }

  &__menuIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.primary};
    transition: color 0.2s ease-in-out;
  }

  &__menuItem.active &__menuIcon {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    color: ${({ theme }) => theme.colors.text.secondary};
    transition: color 0.2s ease-in-out;
  }

  &__dropdown {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 32px;
    margin-top: 4px;
  }

  &__dropdownGroup {
    margin-bottom: 8px;
  }

  &__dropdownGroupTitle {
    padding: 8px 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__dropdownItem {
    padding: 8px 12px;
    cursor: pointer;
    background-color: transparent;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.sunken};
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.surface.raised};
    }
  }
`;
