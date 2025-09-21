import { useEffect, useState } from 'react';

import { dimensions } from '@src/styles/style';

export function useIsDesktop() {
  const [isDesktopLayout, setIsDesktopLayout] = useState<boolean | undefined>(undefined);

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

  return isDesktopLayout;
}
