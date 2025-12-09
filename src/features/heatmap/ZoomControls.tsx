import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const PRESETS = [25, 50, 75, 100, 150, 200, 300, 400];

type ZoomControlsProps = {
  className?: string;
};

const Component: FC<ZoomControlsProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(100);
  const percentRef = useRef(percent);

  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

  useEffect(() => {
    const onPercent = (e: CustomEvent<{ percent: number }>) => setPercent(e.detail.percent);
    heatMapEventBus.on('camera:percent', onPercent);
    return () => heatMapEventBus.off('camera:percent', onPercent);
  }, []);

  const step = useCallback((dir: -1 | 1) => {
    const currentPercent = percentRef.current;
    const idx = PRESETS.findIndex((v) => v >= currentPercent);
    const safeIdx = idx === -1 ? PRESETS.length - 1 : idx;
    const next = PRESETS[Math.min(PRESETS.length - 1, Math.max(0, safeIdx + dir))];
    heatMapEventBus.emit('camera:set-zoom-percent', { percent: next });
  }, []);

  const setPreset = useCallback((p: number) => {
    heatMapEventBus.emit('camera:set-zoom-percent', { percent: p });
    setOpen(false);
  }, []);

  const fit = useCallback(() => heatMapEventBus.emit('camera:fit'), []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === '+') step(1);
      if (ev.key === '-') step(-1);
      if (ev.key === '0') fit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, fit]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = () => setOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className={className} role='group' aria-label='Zoom controls'>
      <Button className='zoom-btn' onClick={() => step(-1)} aria-label='Zoom out' scheme={'surface'} fontSize={'xs'}>
        −
      </Button>
      <div className='zoom-select'>
        <Button
          className='zoom-btn zoom-btn--wide'
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-haspopup='listbox'
          fontSize={'xs'}
          scheme={'surface'}
        >
          <span className='zoom-percent'>{percent}%</span>
          <span className='zoom-caret'>▾</span>
        </Button>
        {open && (
          <ul className='zoom-dropdown' role='listbox'>
            {PRESETS.map((p) => (
              <li key={p}>
                <button className='zoom-item' role='option' aria-selected={p === percent} onClick={() => setPreset(p)}>
                  {p}%
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button className='zoom-btn' onClick={() => step(1)} aria-label='Zoom in' scheme={'surface'} fontSize={'xs'}>
        ＋
      </Button>
    </div>
  );
};

export const ZoomControls = memo(styled(Component)`
  display: flex;
  gap: 2px;
  align-items: center;
  padding: 4px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.md};

  .zoom-btn {
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;

    &--wide {
      min-width: 52px;
      padding: 0 8px;
    }
  }

  .zoom-percent {
    font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .zoom-caret {
    margin-left: 4px;
    font-size: 8px;
    opacity: 0.6;
  }

  .zoom-select {
    position: relative;
  }

  .zoom-dropdown {
    position: absolute;
    bottom: 36px;
    left: 50%;
    z-index: 10;
    width: 80px;
    padding: 4px;
    list-style: none;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 8px;
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateX(-50%);
  }

  .zoom-item {
    width: 100%;
    padding: 6px 8px;
    font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: center;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.raised};
    }

    &[aria-selected='true'] {
      color: ${({ theme }) => theme.colors.primary.contrast};
      background: ${({ theme }) => theme.colors.primary.main};
    }
  }
`);

ZoomControls.displayName = 'ZoomControls';
