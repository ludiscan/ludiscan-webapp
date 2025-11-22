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
    // Trigger fade-in animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`${className} ${isVisible ? 'visible' : ''}`}>
      <div className={`${className}__content`}>
        <h1 className={`${className}__title`}>
          ゲームプレイを
          <br />
          可視化する次世代ツール
        </h1>
        <p className={`${className}__subtitle`}>
          3D/2Dヒートマップで、プレイヤーの行動パターンとイベントを
          <br />
          リアルタイムに分析・改善
        </p>
        <div className={`${className}__cta`}>
          <Link href='/login' className={`${className}__primary-button`}>
            無料で始める
          </Link>
          <Link href='/heatmap/docs' className={`${className}__secondary-button`}>
            デモを見る
          </Link>
        </div>
      </div>
    </section>
  );
};

export const HeroSection = styled(Component)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 4rem 2rem;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 1s ease-out,
    transform 1s ease-out;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 1000px;
  }

  &__title {
    margin: 0 0 1.5rem;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 700;
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main} 0%, ${({ theme }) => theme.colors.primary.light} 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    margin: 0 0 3rem;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 400;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.9;
  }

  &__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  &__primary-button,
  &__secondary-button {
    display: inline-block;
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    transition: all 0.3s ease;
  }

  &__primary-button {
    color: ${({ theme }) => theme.colors.background.default};
    background: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 10px 30px rgb(0 112 243 / 30%);

    &:hover {
      background: ${({ theme }) => theme.colors.primary.light};
      box-shadow: 0 15px 40px rgb(0 112 243 / 40%);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__secondary-button {
    color: ${({ theme }) => theme.colors.text.primary};
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.primary.main};

    &:hover {
      background: ${({ theme }) => theme.colors.primary.main}22;
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (width <= 768px) {
    min-height: 90vh;
    padding: 2rem 1.5rem;

    &__title {
      margin-bottom: 1rem;
    }

    &__subtitle {
      margin-bottom: 2rem;

      br {
        display: none;
      }
    }

    &__cta {
      flex-direction: column;
      gap: 1rem;
    }

    &__primary-button,
    &__secondary-button {
      width: 100%;
      max-width: 300px;
    }
  }
`;
