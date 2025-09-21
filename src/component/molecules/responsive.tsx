import type { FC, ReactNode } from 'react';

import { useIsDesktop } from '@src/hooks/useIsDesktop';

const Component: FC<{ desktop: ReactNode; mobile: ReactNode }> = ({ desktop, mobile }) => {
  const isDesktopLayout = useIsDesktop();

  if (isDesktopLayout === undefined) {
    return null;
  }

  return <>{isDesktopLayout ? desktop : mobile}</>;
};

export const DesktopLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={children} mobile={null} />;
};

export const MobileLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={null} mobile={children} />;
};
