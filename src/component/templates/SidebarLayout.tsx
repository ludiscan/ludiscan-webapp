import styled from '@emotion/styled';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiHome, BiUser, BiKey, BiLock } from 'react-icons/bi';

import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';

export type SidebarLayoutProps = {
  className?: string | undefined;
};

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', href: '/home', icon: <BiHome size={20} />, requiresAuth: true },
  { label: 'Profile', href: '/profile', icon: <BiUser size={20} />, requiresAuth: true },
  { label: 'API Keys', href: '/api-keys', icon: <BiKey size={20} />, requiresAuth: true },
  { label: 'Security', href: '/security', icon: <BiLock size={20} />, requiresAuth: true },
];

const Component: FC<SidebarLayoutProps> = ({ className }) => {
  const pathname = usePathname();
  const { theme } = useSharedTheme();
  const { isAuthorized } = useAuth();

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const visibleItems = MENU_ITEMS.filter((item) => !item.requiresAuth || isAuthorized);

  return (
    <ResponsiveSidebar>
      <div className={className}>
        <FlexColumn gap={8}>
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`${className}__menuItem ${isActive(item.href) ? 'active' : ''}`}>
                <FlexRow gap={12} align={'center'} className={`${className}__menuContent`}>
                  <div className={`${className}__menuIcon`}>{item.icon}</div>
                  <Text text={item.label} fontSize={fontSizes.medium} fontWeight={fontWeights.bold} color={theme.colors.text} />
                </FlexRow>
              </div>
            </Link>
          ))}
        </FlexColumn>
      </div>
    </ResponsiveSidebar>
  );
};

export const SidebarLayout = styled(Component)`
  display: flex;

  &__menuItem {
    padding: 12px 8px;
    cursor: pointer;
    background-color: transparent;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.light};
    }

    &.active {
      /* Text color in active menu item */
      color: ${({ theme }) => theme.colors.text};
      background-color: ${({ theme }) => theme.colors.surface.dark};
    }
  }

  &__menuContent {
    width: 100%;
  }

  &__menuIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text};
    transition: color 0.2s ease-in-out;
  }

  &__menuItem.active &__menuIcon {
    color: ${({ theme }) => theme.colors.secondary.main};
  }
`;
