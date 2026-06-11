import '@testing-library/jest-dom';
/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

// Suppress console.error inside tests because React outputs `act` warnings
// related to Focus events natively simulated by user-event
// eslint-disable-next-line no-console
const originalError = console.error;
beforeAll(() => {
  // eslint-disable-next-line no-console
  console.error = (...args) => {
    if (/was not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
});

import { useRovingTabIndex, type UseRovingTabIndexOptions } from './useRovingTabIndex';

const DummyComponent = ({ options, itemsCount = 3 }: { options?: UseRovingTabIndexOptions; itemsCount?: number }) => {
  const { containerRef, getItemProps, focusedIndex } = useRovingTabIndex<HTMLUListElement>(options);
  const items = Array.from({ length: itemsCount }, (_, i) => `Item ${i}`);

  return (
    <div>
      <p data-testid='focused-index'>{focusedIndex}</p>
      <ul ref={containerRef} role='listbox'>
        {items.map((item, index) => {
          const itemProps = getItemProps(index);
          return (
            <li key={item} role='option' aria-selected={itemProps['aria-selected'] ?? false} {...itemProps}>
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const DynamicComponent = () => {
  const [count, setCount] = useState(3);
  const { containerRef, getItemProps } = useRovingTabIndex<HTMLUListElement>({});
  const items = Array.from({ length: count }, (_, i) => `Item ${i}`);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Add Item</button>
      <button onClick={() => setCount((c) => Math.max(0, c - 1))}>Remove Item</button>
      <ul ref={containerRef} role='listbox'>
        {items.map((item, index) => {
          const itemProps = getItemProps(index);
          return (
            <li key={item} role='option' aria-selected={itemProps['aria-selected'] ?? false} {...itemProps}>
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

describe('useRovingTabIndex', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should initialize with initialIndex', () => {
    render(<DummyComponent options={{ initialIndex: 1 }} />);
    expect(screen.getByTestId('focused-index').textContent).toBe('1');
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('tabIndex', '-1');
    expect(items[1]).toHaveAttribute('tabIndex', '0');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
    expect(items[2]).toHaveAttribute('tabIndex', '-1');
  });

  it('should handle orientation: vertical (ArrowDown, ArrowUp)', async () => {
    render(<DummyComponent options={{ orientation: 'vertical', loop: false }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(items[2]).toHaveFocus();

    // Horizontal shouldn't work
    await user.keyboard('{ArrowRight}');
    expect(items[2]).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(items[1]).toHaveFocus();
  });

  it('should handle orientation: horizontal (ArrowRight, ArrowLeft)', async () => {
    render(<DummyComponent options={{ orientation: 'horizontal', loop: false }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowRight}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(items[2]).toHaveFocus();

    // Vertical shouldn't work
    await user.keyboard('{ArrowDown}');
    expect(items[2]).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(items[1]).toHaveFocus();
  });

  it('should handle orientation: both', async () => {
    render(<DummyComponent options={{ orientation: 'both', loop: false }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(items[2]).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(items[0]).toHaveFocus();
  });

  it('should handle loop: true', async () => {
    render(<DummyComponent options={{ orientation: 'vertical', loop: true }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowUp}');
    expect(items[2]).toHaveFocus(); // Loops to end

    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus(); // Loops to start
  });

  it('should handle loop: false', async () => {
    render(<DummyComponent options={{ orientation: 'vertical', loop: false }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowUp}');
    expect(items[0]).toHaveFocus(); // Does not loop

    await user.keyboard('{End}');
    expect(items[2]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(items[2]).toHaveFocus(); // Does not loop
  });

  it('should handle homeEndKeys: true', async () => {
    render(<DummyComponent options={{ homeEndKeys: true }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{End}');
    expect(items[2]).toHaveFocus();

    await user.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
  });

  it('should handle homeEndKeys: false', async () => {
    render(<DummyComponent options={{ homeEndKeys: false }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{End}');
    expect(items[0]).toHaveFocus(); // Focus should not move

    items[2].focus();
    await user.keyboard('{Home}');
    expect(items[2]).toHaveFocus(); // Focus should not move
  });

  it('should trigger onSelect on Enter, Space, and Click', async () => {
    const onSelect = jest.fn();
    render(<DummyComponent options={{ onSelect }} />);
    const items = screen.getAllByRole('option');

    await user.click(items[1]);
    expect(onSelect).toHaveBeenCalledWith(1);

    items[1].focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(1);

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith(1);

    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it('should trigger onFocusChange when navigating', async () => {
    const onFocusChange = jest.fn();
    render(<DummyComponent options={{ onFocusChange }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowDown}');
    expect(onFocusChange).toHaveBeenCalledWith(1);

    // Clicking also focuses
    await user.click(items[2]);
    expect(onFocusChange).toHaveBeenCalledWith(2);
  });

  it('should do nothing when enabled: false', async () => {
    const onFocusChange = jest.fn();
    render(<DummyComponent options={{ enabled: false, onFocusChange }} />);
    const items = screen.getAllByRole('option');
    items[0].focus();

    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus(); // Shouldn't move
    expect(onFocusChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('focused-index').textContent).toBe('0');
  });

  it('should update boundaries when items are added dynamically', async () => {
    render(<DynamicComponent />);
    const getItems = () => screen.getAllByRole('option');
    let items = getItems();

    items[0].focus();
    await user.keyboard('{End}');
    expect(getItems()[2]).toHaveFocus();

    // Add an item
    await user.click(screen.getByText('Add Item'));
    // Focus might be lost to button, so refocus
    items = getItems();
    items[2].focus();

    // Now there are 4 items, End should go to 3rd index
    await user.keyboard('{End}');
    expect(getItems()[3]).toHaveFocus();

    // Remove 2 items
    await user.click(screen.getByText('Remove Item'));
    await user.click(screen.getByText('Remove Item'));

    items = getItems();
    items[1].focus();
    // Now there are 2 items, End should go to 1st index
    await user.keyboard('{End}');
    expect(getItems()[1]).toHaveFocus();
  });

  it('should focus the item on mouse hover/focus if focus changes', async () => {
    const onFocusChange = jest.fn();
    render(<DummyComponent options={{ onFocusChange }} />);
    const items = screen.getAllByRole('option');

    // native focus event triggers the onFocus handler in getItemProps
    items[2].focus();
    expect(onFocusChange).toHaveBeenCalledWith(2);
  });
});
