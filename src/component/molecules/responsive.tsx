import { useEffect, useState } from 'react';

import type { FC, ReactNode } from 'react';

import { dimensions } from '@src/styles/style';

const Component: FC<{ desktop: ReactNode; mobile: ReactNode }> = ({ desktop, mobile }) => {
  const [isDesktopLayout, setIsDesktopLayout] = useState(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(`(max-width: ${dimensions.mobileWidth}px)`);
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsDesktopLayout(!event.matches);
    };
    setIsDesktopLayout(!mediaQueryList.matches);
    // Add listener for media query changes
    mediaQueryList.addEventListener('change', handleMediaChange);
    return () => {
      mediaQueryList.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return <>{isDesktopLayout ? desktop : mobile}</>;
};

export const DesktopLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={children} mobile={null} />;
};

export const MobileLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <Component desktop={null} mobile={children} />;
};
