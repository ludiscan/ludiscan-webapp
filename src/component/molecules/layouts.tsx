import { useCallback, useEffect, useState } from 'react';

import type { FC, ReactNode } from 'react';

import { dimensions } from '@src/styles/style';

const Component: FC<{ desktop: ReactNode; mobile: ReactNode }> = ({ desktop, mobile }) => {
  const [isDesktopLayout, setIsDesktopLayout] = useState(true);

  const matchMedia = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia(`(max-width: ${dimensions.mobileWidth}px)`).matches) {
      setIsDesktopLayout(false);
    } else {
      setIsDesktopLayout(true);
    }
  }, []);
  useEffect(() => {
    window.addEventListener('resize', matchMedia);
    matchMedia();
    return () => {
      window.removeEventListener('resize', matchMedia);
    };
  }, [matchMedia]);
  return <>{isDesktopLayout ? desktop : mobile}</>;
};

export const DesktopLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={children} mobile={null} />;
};

export const MobileLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={null} mobile={children} />;
};
