/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('should update value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Initial state
    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not be updated immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should be updated after delay
    expect(result.current).toBe('updated');
  });

  test('should not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Fast-forward time just before delay
    act(() => {
      jest.advanceTimersByTime(499);
    });

    // Value should not be updated yet
    expect(result.current).toBe('initial');
  });

  test('should debounce multiple updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value first time
    rerender({ value: 'update 1', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Update value second time before delay
    rerender({ value: 'update 2', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    // First update should be cancelled, still initial
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(250); // Total 500ms since second update
    });

    // Should contain the last update
    expect(result.current).toBe('update 2');
  });
});
