import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { FC } from 'react';

type HeroSectionProps = {
  className?: string;
};

const Component: FC<HeroSectionProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* Decorative elements */}
      <div className={`${className}__orb ${className}__orb--1`} />
      <div className={`${className}__orb ${className}__orb--2`} />
      <div className={`${className}__grid-overlay`} />

      <div className={`${className}__content`}>
        <div className={`${className}__badge`}>
          <span className={`${className}__badge-dot`} />
          Game Analytics Platform
        </div>

        <h1 className={`${className}__title`}>
          <span className={`${className}__title-line`}>プレイヤーの</span>
          <span className={`${className}__title-line ${className}__title-line--accent`}>行動を可視化</span>
        </h1>

        <p className={`${className}__subtitle`}>
          3D/2Dヒートマップとリアルタイム分析で
          <br />
          ゲームデータからインサイトを引き出す
        </p>

        <div className={`${className}__cta`}>
          <Link href='/login' className={`${className}__primary-button`}>
            <span>無料で始める</span>
            <svg className={`${className}__arrow`} width='20' height='20' viewBox='0 0 20 20' fill='none'>
              <path d='M4 10H16M16 10L11 5M16 10L11 15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </Link>
          <Link href='/heatmap/docs/heatmap/getting-started' className={`${className}__secondary-button`}>
            ドキュメントを見る
          </Link>
        </div>

        <div className={`${className}__stats`}>
          <div className={`${className}__stat`}>
            <span className={`${className}__stat-value`}>3D/2D</span>
            <span className={`${className}__stat-label`}>ヒートマップ対応</span>
          </div>
          <div className={`${className}__stat-divider`} />
          <div className={`${className}__stat`}>
            <span className={`${className}__stat-value`}>AI搭載</span>
            <span className={`${className}__stat-label`}>Route Coach</span>
          </div>
          <div className={`${className}__stat-divider`} />
          <div className={`${className}__stat`}>
            <span className={`${className}__stat-value`}>Real-time</span>
            <span className={`${className}__stat-label`}>データ処理</span>
          </div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className={`${className}__shapes`}>
        <div className={`${className}__shape ${className}__shape--1`} />
        <div className={`${className}__shape ${className}__shape--2`} />
        <div className={`${className}__shape ${className}__shape--3`} />
      </div>
    </section>
  );
};

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const HeroSection = styled(Component)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 6rem 2rem;
  overflow: hidden;

  /* Grid overlay for techy feel */
  &__grid-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: linear-gradient(rgb(0 245 255 / 3%) 1px, transparent 1px), linear-gradient(90deg, rgb(0 245 255 / 3%) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* Glowing orbs */
  &__orb {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    filter: blur(80px);

    &--1 {
      top: 10%;
      right: 10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgb(0 245 255 / 30%) 0%, transparent 70%);
      animation: ${pulse} 8s ease-in-out infinite;
    }

    &--2 {
      bottom: 10%;
      left: 5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgb(168 144 211 / 25%) 0%, transparent 70%);
      animation: ${pulse} 10s ease-in-out infinite 2s;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    max-width: 900px;
    text-align: center;
  }

  &__badge {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 1rem;
    margin-bottom: 2rem;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.secondary.main};
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: ${({ theme }) => theme.colors.secondary.main}15;
    border: 1px solid ${({ theme }) => theme.colors.secondary.main}40;
    border-radius: 100px;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.2s forwards;
  }

  &__badge-dot {
    width: 6px;
    height: 6px;
    background: ${({ theme }) => theme.colors.semantic.success.main};
    border-radius: 50%;
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.semantic.success.main};
    animation: ${pulse} 2s ease-in-out infinite;
  }

  &__title {
    margin: 0 0 1.5rem;
    font-size: clamp(2.5rem, 8vw, 5.5rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  &__title-line {
    display: block;
    color: ${({ theme }) => theme.colors.text.primary};
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out forwards;

    &:nth-of-type(1) {
      animation-delay: 0.3s;
    }

    &--accent {
      background: linear-gradient(135deg, #00f5ff 0%, #a890d3 50%, #ffb800 100%);
      background-clip: text;
      background-size: 200% 200%;
      animation:
        ${slideUp} 0.8s ease-out 0.4s forwards,
        ${gradientMove} 6s ease-in-out infinite;
      -webkit-text-fill-color: transparent;
    }
  }

  &__subtitle {
    max-width: 600px;
    margin: 0 0 3rem;
    font-size: clamp(1rem, 2vw, 1.25rem);
    font-weight: 400;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.5s forwards;
  }

  &__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 4rem;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.6s forwards;
  }

  &__primary-button {
    position: relative;
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: #030303;
    text-decoration: none;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4e0 100%);
    border-radius: 12px;
    box-shadow:
      0 0 30px rgb(0 245 255 / 30%),
      0 10px 40px rgb(0 245 255 / 20%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::before {
      position: absolute;
      inset: 0;
      content: '';
      background: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 40%) 50%, transparent 100%);
      background-size: 200% 100%;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s ease;
      animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
      box-shadow:
        0 0 50px rgb(0 245 255 / 50%),
        0 15px 50px rgb(0 245 255 / 30%);
      transform: translateY(-3px);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  &__arrow {
    transition: transform 0.3s ease;
  }

  &__primary-button:hover &__arrow {
    transform: translateX(4px);
  }

  &__secondary-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border.strong};
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
      border-color: ${({ theme }) => theme.colors.secondary.main};
      box-shadow: 0 0 20px ${({ theme }) => theme.colors.secondary.main}30;
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 2rem;
    background: ${({ theme }) => theme.colors.surface.raised}80;
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 16px;
    opacity: 0;
    backdrop-filter: blur(10px);
    animation: ${slideUp} 0.8s ease-out 0.7s forwards;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    text-align: center;
  }

  &__stat-value {
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #00f5ff;
    letter-spacing: 0.02em;
  }

  &__stat-label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__stat-divider {
    width: 1px;
    height: 40px;
    background: ${({ theme }) => theme.colors.border.default};
  }

  /* Floating shapes */
  &__shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__shape {
    position: absolute;
    border: 1px solid;
    opacity: 0.5;

    &--1 {
      top: 15%;
      right: 15%;
      width: 60px;
      height: 60px;
      border-color: #00f5ff40;
      border-radius: 12px;
      transform: rotate(45deg);
      animation: ${float} 6s ease-in-out infinite;
    }

    &--2 {
      bottom: 25%;
      left: 10%;
      width: 80px;
      height: 80px;
      border-color: ${({ theme }) => theme.colors.secondary.main}40;
      border-radius: 50%;
      animation: ${float} 8s ease-in-out infinite 1s;
    }

    &--3 {
      top: 40%;
      left: 15%;
      width: 40px;
      height: 40px;
      border-color: #ffb80040;
      transform: rotate(30deg);
      animation: ${float} 7s ease-in-out infinite 0.5s;
    }
  }

  @media (width <= 768px) {
    min-height: auto;
    padding: 8rem 1.5rem 4rem;

    &__orb--1 {
      width: 200px;
      height: 200px;
    }

    &__orb--2 {
      width: 250px;
      height: 250px;
    }

    &__badge {
      padding: 0.4rem 0.8rem;
      font-size: 0.65rem;
    }

    &__subtitle br {
      display: none;
    }

    &__cta {
      flex-direction: column;
      width: 100%;
    }

    &__primary-button,
    &__secondary-button {
      justify-content: center;
      width: 100%;
      max-width: 320px;
    }

    &__stats {
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
    }

    &__stat-divider {
      width: 80px;
      height: 1px;
    }

    &__shapes {
      display: none;
    }
  }
`;
