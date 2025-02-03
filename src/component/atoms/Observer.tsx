import { useRef, useEffect } from 'react';

import type { FC } from 'react';

export type ObserverProps = {
  callback: () => void;
};

export const Observer: FC<ObserverProps> = ({ callback }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current === null) {
      return;
    }

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      if (entries[0].intersectionRatio <= 0) {
        return;
      }

      callback();

      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    });

    observer.observe(divRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback]);

  return <div ref={divRef} />;
};
