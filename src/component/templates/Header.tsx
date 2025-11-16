import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CiUser, CiLight, CiDark } from 'react-icons/ci';
import { FiChevronLeft } from 'react-icons/fi';
import { IoBell } from 'react-icons/io5';
import { MdLogout } from 'react-icons/md';

import type { ReleaseResponse } from '@src/pages/api/releases.api';
import type { ThemeType } from '@src/modeles/theme';
import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexRow, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { IconLabelRow } from '@src/component/molecules/IconLabelRow';
import { EllipsisMenu, Menu } from '@src/component/molecules/Menu';
import { Selector } from '@src/component/molecules/Selector';
import { DesktopLayout, MobileLayout } from '@src/component/molecules/responsive';
import { UpdateHistoryModal } from '@src/component/organisms/UpdateHistoryModal';
import { useAuth } from '@src/hooks/useAuth';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import themes from '@src/modeles/theme';
import { dimensions } from '@src/styles/style';

const LAST_VIEWED_VERSION_KEY = 'ludiscan-last-viewed-version';

export type HeaderProps = {
  className?: string | undefined;
  iconTitleEnd?: ReactNode;
  title: string;
  iconEnd?: ReactNode;
  isOffline?: boolean;
  onClick?: () => void | Promise<void>;
};

const Component: FC<HeaderProps> = ({ className, title, onClick, iconTitleEnd, iconEnd, isOffline = false }) => {
  const { theme, themeType, toggleTheme, setThemeType } = useSharedTheme();

  const { isAuthorized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);

  const isLoginPage = useMemo(() => pathname === '/login', [pathname]);

  const themeTypeOptions = useMemo(() => Object.keys(themes) as ThemeType[], []);

  // Fetch releases to check for new updates
  const { data: releaseData } = useQuery<ReleaseResponse>({
    queryKey: ['releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    enabled: !isOffline,
  });

  // Check if there are new updates
  useEffect(() => {
    if (releaseData?.releases && releaseData.releases.length > 0) {
      const latestVersion = releaseData.releases[0].tag_name;
      const lastViewedVersion = localStorage.getItem(LAST_VIEWED_VERSION_KEY);
      setHasUnreadUpdates(lastViewedVersion !== latestVersion);
    }
  }, [releaseData]);

  const backIconHandle = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleThemeTypeChange = useCallback(
    (value: string) => {
      setThemeType(value as ThemeType);
    },
    [setThemeType],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  const handleOpenUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(true);
    setHasUnreadUpdates(false);
  }, []);

  const handleCloseUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);
  return (
    <header className={className}>
      <FlexRow align={'center'} gap={12} className={`${className}__innerHeader`} wrap={'nowrap'}>
        {onClick && (
          <Button fontSize={'xl'} onClick={backIconHandle} scheme={'none'}>
            <FiChevronLeft />
          </Button>
        )}
        <Image
          className={`${className}__logo ${theme.mode === 'light' && 'light'}`}
          src={'/favicon/favicon.svg'}
          alt={'ludiscan'}
          width={onClick ? 28 : 32}
          height={onClick ? 28 : 32}
        />
        <Text text={'Ludiscan'} href={'/'} target={'_self'} fontSize={theme.typography.fontSize.xl} fontWeight={theme.typography.fontWeight.bold} />
        <Text text={title} fontSize={theme.typography.fontSize.base} fontWeight={theme.typography.fontWeight.bold} color={theme.colors.text.secondary} />
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
            <EllipsisMenu fontSize={'xl'} scheme={'none'}>
              <Menu.ContentRow>{iconEnd}</Menu.ContentRow>
            </EllipsisMenu>
          </MobileLayout>
        )}

        {/* Desktop Layout - 全ての要素を横並びで表示 */}
        <DesktopLayout>
          <Divider orientation={'vertical'} />
          <InlineFlexRow align={'center'} gap={4} style={{ height: '100%' }} wrap={'nowrap'}>
            <Button fontSize={'xl'} onClick={toggleTheme} scheme={'none'}>
              {theme.mode === 'light' ? <CiDark size={24} color={theme.colors.text.primary} /> : <CiLight size={24} color={theme.colors.text.primary} />}
            </Button>
            <Selector
              options={themeTypeOptions}
              value={themeType}
              onChange={handleThemeTypeChange}
              fontSize={'base'}
              scheme={'none'}
              border={false}
              placement={'bottom'}
              align={'right'}
            />
            {!isOffline && !isLoginPage && (
              <>
                <Divider orientation={'vertical'} />
                <div className={`${className}__bellIconWrapper`}>
                  <Button fontSize={'xl'} onClick={handleOpenUpdateModal} scheme={'none'} title='Update History'>
                    <IoBell size={24} color={theme.colors.text.primary} />
                  </Button>
                  {hasUnreadUpdates && <span className={`${className}__unreadBadge`} />}
                </div>
                <Divider orientation={'vertical'} />
                {isAuthorized ? (
                  <Menu fontSize={'xl'} scheme={'none'} icon={<CiUser size={24} color={theme.colors.text.primary} />}>
                    <Menu.ContentColumn gap={4} align={'right'} placement={'bottom'} offset={16}>
                      <IconLabelRow className={`${className}__iconLabelRow`} gap={8} label={'Profile'} icon={<CiUser />} href={'/profile'} target={'_self'} />
                      <Divider orientation={'horizontal'} margin={'0'} />
                      <IconLabelRow className={`${className}__iconLabelRow accent`} gap={8} label={'Logout'} icon={<MdLogout />} onClick={handleLogout} />
                    </Menu.ContentColumn>
                  </Menu>
                ) : (
                  <Text
                    text={'Sign in'}
                    href={'/login'}
                    target={'_self'}
                    fontSize={theme.typography.fontSize.base}
                    fontWeight={theme.typography.fontWeight.bold}
                  />
                )}
              </>
            )}
          </InlineFlexRow>
        </DesktopLayout>

        {/* Mobile Layout - 3点メニューに統合 */}
        <MobileLayout>
          <EllipsisMenu fontSize={'xl'} scheme={'none'}>
            <Menu.ContentColumn gap={8} align={'right'} placement={'bottom'} offset={16}>
              <IconLabelRow
                className={`${className}__iconLabelRow`}
                gap={8}
                label={theme.mode === 'light' ? 'Dark mode' : 'Light mode'}
                icon={theme.mode === 'light' ? <CiDark /> : <CiLight />}
                onClick={toggleTheme}
              />
              <Divider orientation={'horizontal'} margin={'0'} />
              <FlexRow align={'center'} gap={8} style={{ padding: '0 8px' }}>
                <Text text={'Theme:'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
                <Selector
                  options={themeTypeOptions}
                  value={themeType}
                  onChange={handleThemeTypeChange}
                  fontSize={'base'}
                  scheme={'none'}
                  border={false}
                  placement={'bottom'}
                  align={'right'}
                />
              </FlexRow>
              {!isOffline && !isLoginPage && (
                <>
                  <Divider orientation={'horizontal'} margin={'0'} />
                  <FlexRow className={`${className}__bellIconWrapperMobile`}>
                    <IconLabelRow className={`${className}__iconLabelRow`} gap={8} label={'Update History'} icon={<IoBell />} onClick={handleOpenUpdateModal} />
                    {hasUnreadUpdates && <span className={`${className}__unreadBadgeMobile`} />}
                  </FlexRow>
                  <Divider orientation={'horizontal'} margin={'0'} />
                  {isAuthorized ? (
                    <>
                      <IconLabelRow className={`${className}__iconLabelRow`} gap={8} label={'Profile'} icon={<CiUser />} href={'/profile'} target={'_self'} />
                      <Divider orientation={'horizontal'} margin={'0'} />
                      <IconLabelRow className={`${className}__iconLabelRow accent`} gap={8} label={'Logout'} icon={<MdLogout />} onClick={handleLogout} />
                    </>
                  ) : (
                    <IconLabelRow className={`${className}__iconLabelRow`} gap={8} label={'Sign in'} icon={<CiUser />} href={'/login'} target={'_self'} />
                  )}
                </>
              )}
            </Menu.ContentColumn>
          </EllipsisMenu>
        </MobileLayout>
      </FlexRow>
      <UpdateHistoryModal isOpen={isUpdateModalOpen} onClose={handleCloseUpdateModal} />
    </header>
  );
};

export const Header = styled(Component)`
  display: flex;
  height: ${dimensions.headerHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surface.base};
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
    color: ${({ theme }) => theme.colors.semantic.error.main};
  }

  &__logo {
    width: ${({ onClick }) => (onClick ? '28px' : '32px')};
    height: ${({ onClick }) => (onClick ? '28px' : '32px')};
    filter: invert(100%);
  }

  &__logo.light {
    filter: invert(0%);
  }

  &__bellIconWrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__unreadBadge {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
    border: 2px solid ${({ theme }) => theme.colors.surface.base};
    border-radius: 50%;
    pointer-events: none;
  }

  &__bellIconWrapperMobile {
    position: relative;
  }

  &__unreadBadgeMobile {
    position: absolute;
    top: 8px;
    left: 18px;
    width: 8px;
    height: 8px;
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
    border: 2px solid ${({ theme }) => theme.colors.surface.base};
    border-radius: 50%;
    pointer-events: none;
  }
`;
