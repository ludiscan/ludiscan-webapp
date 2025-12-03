import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo } from 'react';

import type { FC } from 'react';

type DashboardBackgroundCanvasProps = {
  className?: string;
};

/**
 * Minimalist mountain landscape background.
 * Smooth, rolling mountain silhouettes with gentle curves.
 * Adapts to light/dark theme via CSS custom properties.
 */
const Component: FC<DashboardBackgroundCanvasProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* Sky base */}
      <div className='layer layer-sky' />

      {/* Sun glow */}
      <div className='layer layer-sun' />

      {/* Mountain silhouettes - smooth curves, back to front */}
      <div className='layer layer-ridge-far' />
      <div className='layer layer-ridge-mid' />
      <div className='layer layer-ridge-near' />
    </div>
  );
};

const drift = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(0.3%);
  }
`;

const sunPulse = keyframes`
  0%, 100% {
    opacity: var(--sun-opacity-min);
  }
  50% {
    opacity: var(--sun-opacity-max);
  }
`;

export const DashboardBackgroundCanvas = styled(memo(Component))`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease;

  /* Dark theme colors (default) */
  --sky-top: hsl(225deg 30% 8%);
  --sky-bottom: hsl(220deg 20% 18%);
  --sun-color: hsl(40deg 50% 65%);
  --sun-opacity-min: 0.15;
  --sun-opacity-max: 0.25;
  --ridge-far: hsl(225deg 20% 16%);
  --ridge-mid: hsl(225deg 22% 11%);
  --ridge-near: hsl(225deg 25% 7%);

  /* Light theme overrides */
  [data-theme-mode='light'] & {
    --sky-top: hsl(210deg 50% 92%);
    --sky-bottom: hsl(210deg 35% 75%);
    --sun-color: hsl(45deg 100% 70%);
    --sun-opacity-min: 0.4;
    --sun-opacity-max: 0.6;
    --ridge-far: hsl(220deg 15% 68%);
    --ridge-mid: hsl(220deg 20% 52%);
    --ridge-near: hsl(220deg 25% 38%);
  }

  &.visible {
    opacity: 1;
  }

  .layer {
    position: absolute;
    inset: 0;
  }

  /* Sky - clean gradient */
  .layer-sky {
    background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bottom) 100%);
  }

  /* Sun - soft glow with subtle blur */
  .layer-sun {
    position: absolute;
    inset: auto;
    top: 15%;
    right: 12%;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle at center, var(--sun-color) 0%, color-mix(in srgb, var(--sun-color) 40%, transparent) 35%, transparent 65%);
    border-radius: 50%;
    opacity: var(--sun-opacity-min);
    filter: blur(8px);
    animation: ${sunPulse} 20s ease-in-out infinite;
  }

  /* Far ridge - distant mountains with blur for depth */
  .layer-ridge-far {
    background: var(--ridge-far);
    opacity: 0.45;
    filter: blur(2px);
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 500' preserveAspectRatio='none'%3E%3Cpath d='M0,500 L0,300 Q100,260 200,280 Q350,310 450,220 Q550,130 650,180 Q750,230 850,160 Q950,90 1100,140 Q1250,190 1350,120 Q1450,50 1600,110 Q1750,170 1920,130 L1920,500 Z'/%3E%3C/svg%3E");
    mask-position: bottom;
    mask-size: 100% 100%;
    animation: ${drift} 120s ease-in-out infinite;
  }

  /* Mid ridge - middle layer mountains */
  .layer-ridge-mid {
    background: var(--ridge-mid);
    opacity: 0.7;
    filter: blur(1px);
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 500' preserveAspectRatio='none'%3E%3Cpath d='M0,500 L0,340 Q80,300 160,320 Q300,350 420,250 Q540,150 680,210 Q820,270 940,180 Q1060,90 1200,150 Q1340,210 1480,140 Q1620,70 1760,130 Q1900,190 1920,170 L1920,500 Z'/%3E%3C/svg%3E");
    mask-position: bottom;
    mask-size: 100% 100%;
    animation: ${drift} 150s ease-in-out infinite reverse;
  }

  /* Near ridge - closest mountains */
  .layer-ridge-near {
    background: var(--ridge-near);
    opacity: 0.95;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 500' preserveAspectRatio='none'%3E%3Cpath d='M0,500 L0,370 Q60,340 120,355 Q240,380 380,290 Q520,200 660,260 Q800,320 920,240 Q1040,160 1180,220 Q1320,280 1460,200 Q1600,120 1740,180 Q1880,240 1920,210 L1920,500 Z'/%3E%3C/svg%3E");
    mask-position: bottom;
    mask-size: 100% 100%;
  }

  @media (width <= 768px) {
    .layer-ridge-far,
    .layer-ridge-mid,
    .layer-ridge-near {
      filter: none;
      mask-image: none;
    }

    .layer-ridge-far {
      background: linear-gradient(180deg, transparent 50%, var(--ridge-far) 100%);
      opacity: 0.4;
    }

    .layer-ridge-mid {
      background: linear-gradient(180deg, transparent 60%, var(--ridge-mid) 100%);
      opacity: 0.6;
    }

    .layer-ridge-near {
      background: linear-gradient(180deg, transparent 70%, var(--ridge-near) 100%);
      opacity: 0.9;
    }

    .layer-sun {
      top: 10%;
      right: 8%;
      width: 160px;
      height: 160px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .layer-ridge-far,
    .layer-ridge-mid,
    .layer-sun {
      animation: none;
    }

    .layer-sun {
      opacity: var(--sun-opacity-max);
    }
  }
`;
