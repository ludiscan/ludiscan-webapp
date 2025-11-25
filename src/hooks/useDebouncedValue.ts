import { useEffect, useState } from 'react';

/**
 * デバウンスされた値を返すカスタムフック
 * @param value - デバウンスする値
 * @param delay - デバウンス遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
