import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo, useEffect, useMemo, useState } from 'react';

import type { FC } from 'react';

type DashboardBackgroundCanvasProps = {
  className?: string;
};

/**
 * Adaptive Dashboard Background
 *
 * Dark Mode: Ethereal aurora-like data streams with floating particles
 * Light Mode: Soft gradient mesh with organic flowing shapes and subtle grain
 *
 * Uses theme.colors for consistency with app design system
 * Auto-fades in after mount for smooth page transitions
 */
const Component: FC<DashboardBackgroundCanvasProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate deterministic particle positions for dark mode
  const particles = useMemo(() => {
    const result = [];
    for (let i = 0; i < 40; i++) {
      const seed1 = ((i * 7919) % 100) / 100;
      const seed2 = ((i * 6991) % 100) / 100;
      const seed3 = ((i * 5449) % 100) / 100;
      result.push({
        left: `${seed1 * 100}%`,
        top: `${seed2 * 100}%`,
        delay: `${seed3 * 20}s`,
        duration: `${15 + seed1 * 20}s`,
        size: 1 + seed2 * 2,
      });
    }
    return result;
  }, []);

  return (
    <div className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* ===== SHARED: Base gradient ===== */}
      <div className='layer layer-base' />

      {/* ===== DARK MODE: Aurora + Particles ===== */}
      <div className='dark-only'>
        <div className='layer layer-grid' />
        <div className='layer layer-aurora'>
          <div className='aurora-ribbon aurora-ribbon--1' />
          <div className='aurora-ribbon aurora-ribbon--2' />
          <div className='aurora-ribbon aurora-ribbon--3' />
        </div>
        <div className='layer layer-mesh'>
          <div className='mesh-blob mesh-blob--1' />
          <div className='mesh-blob mesh-blob--2' />
          <div className='mesh-blob mesh-blob--3' />
        </div>
        <div className='layer layer-particles'>
          {particles.map((p, i) => (
            <span
              key={i}
              className='particle'
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== LIGHT MODE: Gradient Mesh + Organic Flow ===== */}
      <div className='light-only'>
        {/* Soft gradient orbs */}
        <div className='layer layer-orbs'>
          <div className='orb orb1' />
          <div className='orb orb2' />
          <div className='orb orb3' />
          <div className='orb orb4' />
        </div>

        {/* Flowing organic shapes */}
        <div className='layer layer-flow'>
          <div className='flow-shape flow-shape1' />
          <div className='flow-shape flow-shape2' />
          <div className='flow-shape flow-shape3' />
        </div>

        {/* Subtle grain texture overlay */}
        <div className='layer layer-grain' />

        {/* Soft highlight accent */}
        <div className='layer layer-highlight' />
      </div>

      {/* ===== SHARED: Vignette ===== */}
      <div className='layer layer-vignette' />
    </div>
  );
};

/* ===== DARK MODE ANIMATIONS ===== */
const float = keyframes`
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  50% {
    transform: translateY(-30vh) translateX(10px);
  }
`;

const auroraFlow1 = keyframes`
  0% { transform: translateX(-5%) skewY(-2deg) scaleY(1); opacity: 0.4; }
  25% { transform: translateX(2%) skewY(1deg) scaleY(1.1); opacity: 0.6; }
  50% { transform: translateX(5%) skewY(3deg) scaleY(0.9); opacity: 0.5; }
  75% { transform: translateX(-2%) skewY(-1deg) scaleY(1.05); opacity: 0.55; }
  100% { transform: translateX(-5%) skewY(-2deg) scaleY(1); opacity: 0.4; }
`;

const auroraFlow2 = keyframes`
  0% { transform: translateX(3%) skewY(1deg) scaleY(1); opacity: 0.35; }
  33% { transform: translateX(-4%) skewY(-2deg) scaleY(1.15); opacity: 0.5; }
  66% { transform: translateX(6%) skewY(2deg) scaleY(0.85); opacity: 0.45; }
  100% { transform: translateX(3%) skewY(1deg) scaleY(1); opacity: 0.35; }
`;

const auroraFlow3 = keyframes`
  0% { transform: translateX(-3%) skewY(-1deg) scaleY(1); opacity: 0.3; }
  50% { transform: translateX(4%) skewY(2deg) scaleY(1.2); opacity: 0.45; }
  100% { transform: translateX(-3%) skewY(-1deg) scaleY(1); opacity: 0.3; }
`;

const meshFloat1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(5%, 3%) scale(1.1) rotate(2deg); }
  66% { transform: translate(-3%, -2%) scale(0.95) rotate(-1deg); }
`;

const meshFloat2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(-4%, 5%) scale(1.15) rotate(-3deg); }
`;

const meshFloat3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(3%, -4%) scale(1.05); }
  75% { transform: translate(-5%, 2%) scale(0.9); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.3; filter: blur(80px); }
  50% { opacity: 0.5; filter: blur(100px); }
`;

/* ===== LIGHT MODE ANIMATIONS ===== */
const orbFloat1 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(3%, -2%) scale(1.05);
    opacity: 0.7;
  }
  50% {
    transform: translate(-2%, 3%) scale(0.95);
    opacity: 0.55;
  }
  75% {
    transform: translate(1%, 1%) scale(1.02);
    opacity: 0.65;
  }
`;

const orbFloat2 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.5;
  }
  33% {
    transform: translate(-4%, 2%) scale(1.08) rotate(5deg);
    opacity: 0.6;
  }
  66% {
    transform: translate(2%, -3%) scale(0.92) rotate(-3deg);
    opacity: 0.45;
  }
`;

const orbFloat3 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(5%, 4%) scale(1.1);
    opacity: 0.55;
  }
`;

const orbFloat4 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.35;
  }
  40% {
    transform: translate(-3%, -2%) scale(1.06);
    opacity: 0.5;
  }
  80% {
    transform: translate(2%, 3%) scale(0.94);
    opacity: 0.4;
  }
`;

const flowMorph1 = keyframes`
  0%, 100% {
    border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    border-radius: 50% 50% 40% 60% / 40% 50% 50% 60%;
    transform: translate(2%, -1%) rotate(3deg);
  }
  50% {
    border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
    transform: translate(-1%, 2%) rotate(-2deg);
  }
  75% {
    border-radius: 50% 50% 50% 50% / 50% 40% 60% 50%;
    transform: translate(1%, 1%) rotate(1deg);
  }
`;

const flowMorph2 = keyframes`
  0%, 100% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%;
    transform: translate(-3%, 2%) rotate(-5deg) scale(1.05);
  }
  66% {
    border-radius: 50% 50% 70% 30% / 50% 50% 50% 50%;
    transform: translate(2%, -2%) rotate(3deg) scale(0.95);
  }
`;

const flowMorph3 = keyframes`
  0%, 100% {
    border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%;
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    border-radius: 30% 70% 40% 60% / 70% 30% 70% 30%;
    transform: translate(4%, 3%) rotate(8deg);
  }
`;

const grainShift = keyframes`
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(1%, 0.5%); }
  30% { transform: translate(-0.5%, 1%); }
  40% { transform: translate(0.5%, -0.5%); }
  50% { transform: translate(-1%, 0.5%); }
  60% { transform: translate(1%, -1%); }
  70% { transform: translate(0.5%, 1%); }
  80% { transform: translate(-0.5%, -0.5%); }
  90% { transform: translate(1%, 0.5%); }
`;

const highlightPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

export const DashboardBackgroundCanvas = styled(memo(Component))`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* ===== DARK THEME VARIABLES (using theme.colors) ===== */
  --bg-deep: ${({ theme }) => theme.colors.background.default};
  --bg-mid: ${({ theme }) => theme.colors.surface.base};

  /* Aurora colors - blend of theme primary/secondary/tertiary with vibrant accents */
  --aurora-primary: ${({ theme }) => theme.colors.primary.light};
  --aurora-secondary: ${({ theme }) => theme.colors.secondary.light};
  --aurora-tertiary: ${({ theme }) => theme.colors.tertiary.main};
  --aurora-accent: ${({ theme }) => theme.colors.semantic.info.light};

  /* Mesh blob colors from theme */
  --mesh-1: ${({ theme }) => theme.colors.primary.main};
  --mesh-2: ${({ theme }) => theme.colors.tertiary.main};
  --mesh-3: ${({ theme }) => theme.colors.secondary.main};

  /* Grid and particles */
  --grid-line: ${({ theme }) => theme.colors.border.subtle};
  --particle-color: ${({ theme }) => theme.colors.primary.light};
  --vignette-color: ${({ theme }) => theme.colors.background.default};

  &.visible {
    opacity: 1;
  }

  /* ===== MODE VISIBILITY ===== */
  .dark-only {
    display: block;
  }

  .light-only {
    display: none;
  }

  [data-theme-mode='light'] & {
    --bg-deep: ${({ theme }) => theme.colors.background.default};
    --bg-mid: ${({ theme }) => theme.colors.surface.base};

    /* Orb colors - soft, muted tones */
    --orb-1: ${({ theme }) => theme.colors.primary.light};
    --orb-2: ${({ theme }) => theme.colors.secondary.light};
    --orb-3: ${({ theme }) => theme.colors.tertiary.light};
    --orb-4: ${({ theme }) => theme.colors.semantic.info.light};

    /* Flow shape colors - very subtle */
    --flow-1: ${({ theme }) => theme.colors.primary.main}18;
    --flow-2: ${({ theme }) => theme.colors.secondary.main}12;
    --flow-3: ${({ theme }) => theme.colors.tertiary.main}10;

    /* Highlight */
    --highlight-color: ${({ theme }) => theme.colors.surface.raised};
    --vignette-color: ${({ theme }) => theme.colors.background.default};

    .dark-only {
      display: none;
    }

    .light-only {
      display: block;
    }
  }

  .layer {
    position: absolute;
    inset: 0;
  }

  /* ========================================
     SHARED STYLES
     ======================================== */

  .layer-base {
    background: linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-mid) 100%);

    [data-theme-mode='light'] & {
      background: linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-mid) 50%, var(--bg-deep) 100%);
    }
  }

  .layer-vignette {
    background:
      radial-gradient(ellipse 100% 60% at 50% 0%, var(--vignette-color) 0%, transparent 50%),
      radial-gradient(ellipse 100% 40% at 50% 100%, var(--vignette-color) 0%, transparent 40%);
    opacity: 0.5;

    [data-theme-mode='light'] & {
      opacity: 0.3;
    }
  }

  /* ========================================
     DARK MODE STYLES
     ======================================== */

  .layer-grid {
    background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-position: center center;
    background-size: 60px 60px;
    opacity: 0.6;
    mask-image: radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 70%);
  }

  .layer-aurora {
    mix-blend-mode: screen;
  }

  .aurora-ribbon {
    position: absolute;
    left: -20%;
    width: 140%;
    height: 200px;
    border-radius: 100px;
    filter: blur(60px);
    will-change: transform, opacity;

    &--1 {
      top: 15%;
      background: linear-gradient(90deg, transparent 0%, var(--aurora-primary) 20%, var(--aurora-accent) 50%, var(--aurora-primary) 80%, transparent 100%);
      animation: ${auroraFlow1} 25s ease-in-out infinite;
    }

    &--2 {
      top: 35%;
      height: 160px;
      background: linear-gradient(90deg, transparent 0%, var(--aurora-tertiary) 30%, var(--aurora-secondary) 60%, transparent 100%);
      animation: ${auroraFlow2} 30s ease-in-out infinite;
    }

    &--3 {
      top: 55%;
      height: 180px;
      background: linear-gradient(90deg, transparent 0%, var(--aurora-secondary) 25%, var(--aurora-primary) 50%, var(--aurora-accent) 75%, transparent 100%);
      animation: ${auroraFlow3} 35s ease-in-out infinite;
    }
  }

  .layer-mesh {
    mix-blend-mode: screen;
    opacity: 0.7;
  }

  .mesh-blob {
    position: absolute;
    border-radius: 50%;
    will-change: transform;

    &--1 {
      top: -10%;
      right: -5%;
      width: 50vw;
      max-width: 600px;
      height: 50vw;
      max-height: 600px;
      background: radial-gradient(circle at 30% 30%, var(--mesh-1) 0%, transparent 60%);
      filter: blur(80px);
      animation:
        ${meshFloat1} 40s ease-in-out infinite,
        ${pulseGlow} 8s ease-in-out infinite;
    }

    &--2 {
      bottom: -15%;
      left: -10%;
      width: 55vw;
      max-width: 700px;
      height: 55vw;
      max-height: 700px;
      background: radial-gradient(circle at 70% 70%, var(--mesh-2) 0%, transparent 55%);
      filter: blur(100px);
      animation:
        ${meshFloat2} 45s ease-in-out infinite,
        ${pulseGlow} 10s ease-in-out infinite 2s;
    }

    &--3 {
      top: 30%;
      left: 40%;
      width: 35vw;
      max-width: 400px;
      height: 35vw;
      max-height: 400px;
      background: radial-gradient(circle at 50% 50%, var(--mesh-3) 0%, transparent 50%);
      filter: blur(70px);
      animation:
        ${meshFloat3} 35s ease-in-out infinite,
        ${pulseGlow} 12s ease-in-out infinite 4s;
    }
  }

  .layer-particles .particle {
    position: absolute;
    background: var(--particle-color);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--particle-color);
    opacity: 0;
    animation: ${float} 20s ease-in-out infinite;
  }

  /* ========================================
     LIGHT MODE STYLES
     ======================================== */

  .layer-orbs {
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      will-change: transform, opacity;
    }

    .orb1 {
      top: -15%;
      right: -10%;
      width: 60vw;
      max-width: 800px;
      height: 60vw;
      max-height: 800px;
      background: radial-gradient(circle at 40% 40%, var(--orb-1) 0%, transparent 70%);
      opacity: 0.6;
      animation: ${orbFloat1} 35s ease-in-out infinite;
    }

    .orb2 {
      bottom: -20%;
      left: -15%;
      width: 55vw;
      max-width: 700px;
      height: 55vw;
      max-height: 700px;
      background: radial-gradient(circle at 60% 60%, var(--orb-2) 0%, transparent 65%);
      opacity: 0.5;
      animation: ${orbFloat2} 40s ease-in-out infinite;
    }

    .orb3 {
      top: 30%;
      left: 20%;
      width: 35vw;
      max-width: 450px;
      height: 35vw;
      max-height: 450px;
      background: radial-gradient(circle at 50% 50%, var(--orb-3) 0%, transparent 60%);
      opacity: 0.4;
      animation: ${orbFloat3} 30s ease-in-out infinite;
    }

    .orb4 {
      top: 10%;
      left: 50%;
      width: 25vw;
      max-width: 320px;
      height: 25vw;
      max-height: 320px;
      background: radial-gradient(circle at 50% 50%, var(--orb-4) 0%, transparent 55%);
      opacity: 0.35;
      animation: ${orbFloat4} 28s ease-in-out infinite;
    }
  }

  .layer-flow {
    mix-blend-mode: multiply;
    opacity: 0.8;

    .flow-shape {
      position: absolute;
      will-change: transform, border-radius;
    }

    .flow-shape1 {
      top: 5%;
      right: 10%;
      width: 45vw;
      max-width: 550px;
      height: 40vw;
      max-height: 500px;
      background: linear-gradient(135deg, var(--flow-1) 0%, transparent 100%);
      animation: ${flowMorph1} 25s ease-in-out infinite;
    }

    .flow-shape2 {
      bottom: 10%;
      left: 5%;
      width: 50vw;
      max-width: 600px;
      height: 45vw;
      max-height: 550px;
      background: linear-gradient(-45deg, var(--flow-2) 0%, transparent 100%);
      animation: ${flowMorph2} 30s ease-in-out infinite;
    }

    .flow-shape3 {
      top: 40%;
      left: 35%;
      width: 30vw;
      max-width: 380px;
      height: 30vw;
      max-height: 380px;
      background: radial-gradient(ellipse at center, var(--flow-3) 0%, transparent 70%);
      animation: ${flowMorph3} 22s ease-in-out infinite;
    }
  }

  .layer-grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
    opacity: 0.03;
    animation: ${grainShift} 8s steps(10) infinite;
  }

  .layer-highlight {
    top: 15%;
    left: 60%;
    width: 40vw;
    max-width: 500px;
    height: 40vw;
    max-height: 500px;
    background: radial-gradient(circle at center, var(--highlight-color) 0%, transparent 60%);
    border-radius: 50%;
    opacity: 0.3;
    filter: blur(60px);
    animation: ${highlightPulse} 20s ease-in-out infinite;
  }

  /* ========================================
     RESPONSIVE
     ======================================== */

  @media (width <= 768px) {
    /* Dark mode mobile */
    .layer-grid {
      background-size: 40px 40px;
      opacity: 0.4;
    }

    .aurora-ribbon {
      height: 120px;
      filter: blur(40px);

      &--1 {
        top: 10%;
      }

      &--2 {
        top: 30%;
        height: 100px;
      }

      &--3 {
        top: 50%;
        height: 110px;
      }
    }

    .mesh-blob {
      &--1 {
        width: 70vw;
        height: 70vw;
        filter: blur(60px);
      }

      &--2 {
        width: 80vw;
        height: 80vw;
        filter: blur(70px);
      }

      &--3 {
        width: 50vw;
        height: 50vw;
        filter: blur(50px);
      }
    }

    .layer-particles .particle {
      display: none;
    }

    /* Light mode mobile */
    .layer-orbs {
      .orb {
        filter: blur(70px);
      }

      .orb1 {
        width: 80vw;
        height: 80vw;
      }

      .orb2 {
        width: 75vw;
        height: 75vw;
      }

      .orb3 {
        width: 50vw;
        height: 50vw;
      }

      .orb4 {
        width: 40vw;
        height: 40vw;
      }
    }

    .layer-flow {
      opacity: 0.6;

      .flow-shape {
        filter: blur(20px);
      }
    }

    .layer-grain {
      opacity: 0.02;
    }
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */

  @media (prefers-reduced-motion: reduce) {
    .aurora-ribbon,
    .mesh-blob,
    .particle,
    .orb,
    .flow-shape,
    .layer-grain,
    .layer-highlight {
      animation: none !important;
    }

    .aurora-ribbon {
      opacity: 0.4;
    }

    .mesh-blob {
      opacity: 0.3;
    }

    .orb {
      opacity: 0.5;
    }

    .flow-shape {
      border-radius: 50%;
    }
  }
`;
