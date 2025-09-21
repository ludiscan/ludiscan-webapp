import styled from '@emotion/styled';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { CiUser, CiLight, CiDark } from 'react-icons/ci';
import { FiChevronLeft } from 'react-icons/fi';
import { MdLogout } from 'react-icons/md';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { IconLabelRow } from '@src/component/molecules/IconLabelRow';
import { EllipsisMenu, Menu } from '@src/component/molecules/Menu';
import { DesktopLayout, MobileLayout } from '@src/component/molecules/responsive';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { dimensions, fontSizes, fontWeights } from '@src/styles/style';

export type HeaderProps = {
  className?: string | undefined;
  iconTitleEnd?: ReactNode;
  title: string;
  iconEnd?: ReactNode;
  isOffline?: boolean;
  onClick?: () => void | Promise<void>;
};

const Component: FC<HeaderProps> = ({ className, title, onClick, iconTitleEnd, iconEnd, isOffline = false }) => {
  const { theme, toggleTheme } = useSharedTheme();

  const { isAuthorized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = useMemo(() => pathname === '/login', [pathname]);

  const backIconHandle = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);
  return (
    <header className={className}>
      <FlexRow align={'center'} gap={12} className={`${className}__innerHeader`} wrap={'nowrap'}>
        {onClick && (
          <Button fontSize={'large2'} onClick={backIconHandle} scheme={'none'}>
            <FiChevronLeft />
          </Button>
        )}
        <Image
          className={`${className}__logo ${theme.colors.isLight && 'light'}`}
          src={'/favicon/favicon.svg'}
          alt={'ludiscan'}
          width={onClick ? 28 : 32}
          height={onClick ? 28 : 32}
        />
        <Text text={'Ludiscan'} href={'/'} target={'_self'} fontSize={fontSizes.large2} fontWeight={fontWeights.bold} />
        <Text text={title} fontSize={fontSizes.medium} fontWeight={fontWeights.bold} color={theme.colors.secondary.main} />
        {iconTitleEnd && <>{iconTitleEnd}</>}
        <div style={{ flex: 1 }} />

        {iconEnd && (
          <DesktopLayout>
            <InlineFlexRow align={'center'} gap={8} style={{ height: '100%' }} wrap={'nowrap'}>
              {iconEnd}
            </InlineFlexRow>
          </DesktopLayout>
        )}
        {iconEnd && (
          <MobileLayout>
            <EllipsisMenu fontSize={'large2'} scheme={'none'}>
              <Menu.ContentRow>{iconEnd}</Menu.ContentRow>
            </EllipsisMenu>
          </MobileLayout>
        )}

        <Divider orientation={'vertical'} />
        <InlineFlexRow align={'center'} gap={4} style={{ height: '100%' }} wrap={'nowrap'}>
          <Button fontSize={'large2'} onClick={toggleTheme} scheme={'none'}>
            {theme.colors.isLight ? <CiDark size={24} color={theme.colors.text} /> : <CiLight size={24} color={theme.colors.text} />}
          </Button>
          {!isOffline && !isLoginPage && (
            <>
              <Divider orientation={'vertical'} />
              {isAuthorized ? (
                <Menu fontSize={'large2'} scheme={'none'} icon={<CiUser size={24} color={theme.colors.text} />}>
                  <Menu.ContentColumn gap={4}>
                    <Divider orientation={'horizontal'} margin={'0'} />
                    <IconLabelRow className={`${className}__iconLabelRow accent`} gap={8} label={'Logout'} icon={<MdLogout />} onClick={handleLogout} />
                  </Menu.ContentColumn>
                </Menu>
              ) : (
                <Text text={'Sign in'} href={'/login'} target={'_self'} fontSize={fontSizes.medium} fontWeight={fontWeights.bold} />
              )}
            </>
          )}
        </InlineFlexRow>
      </FlexRow>
    </header>
  );
};

export const Header = styled(Component)`
  display: flex;
  height: ${dimensions.headerHeight}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface.main};
  transition: margin-left 0.3s ease-in-out;

  &__innerHeader {
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px;
    margin: 0 auto;
  }

  &__iconLabelRow {
    padding: 0 2px;
  }

  &__iconLabelRow.accent {
    color: ${({ theme }) => theme.colors.error};
  }

  &__logo {
    width: ${({ onClick }) => (onClick ? '28px' : '32px')};
    height: ${({ onClick }) => (onClick ? '28px' : '32px')};
    filter: invert(100%);
  }

  &__logo.light {
    filter: invert(0%);
  }
`;
