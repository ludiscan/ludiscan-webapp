import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

type TrustItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
};

const GameIcon = () => (
  <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M6 12h.01M10 12h.01M14 12h.01' strokeLinecap='round' />
    <rect x='2' y='6' width='20' height='12' rx='4' />
    <path d='M18 10v4M16 12h4' strokeLinecap='round' />
  </svg>
);

const ShieldIcon = () => (
  <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
    <path d='M9 12l2 2 4-4' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const BoltIcon = () => (
  <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const trustItems: TrustItem[] = [
  {
    icon: <GameIcon />,
    title: '2D/3D対応',
    description: '2Dゲームから3Dゲームまで、様々なゲームのプレイヤーデータを可視化',
    accentColor: '#00f5ff',
  },
  {
    icon: <ShieldIcon />,
    title: 'オープンソース',
    description: 'GitHubでソースコードを公開。自由にカスタマイズ可能',
    accentColor: '#a890d3',
  },
  {
    icon: <BoltIcon />,
    title: 'シンプルな統合',
    description: 'Unity SDKで簡単に導入。数行のコードでデータ収集を開始',
    accentColor: '#ffb800',
  },
];

type TrustSectionProps = {
  className?: string;
};

const Component: FC<TrustSectionProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.15 },
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* Background decorations */}
      <div className={`${className}__bg-line ${className}__bg-line--1`} />
      <div className={`${className}__bg-line ${className}__bg-line--2`} />

      <div className={`${className}__container`}>
        <div className={`${className}__header`}>
          <span className={`${className}__eyebrow`}>Features</span>
          <h2 className={`${className}__title`}>特徴</h2>
        </div>

        <div className={`${className}__grid`}>
          {trustItems.map((item, index) => (
            <article
              key={index}
              className={`${className}__card`}
              style={
                {
                  '--accent-color': item.accentColor,
                  '--delay': `${index * 0.15}s`,
                } as React.CSSProperties
              }
            >
              <div className={`${className}__card-glow`} />
              <div className={`${className}__card-content`}>
                <div className={`${className}__icon-wrapper`}>{item.icon}</div>
                <h3 className={`${className}__card-title`}>{item.title}</h3>
                <p className={`${className}__card-description`}>{item.description}</p>
              </div>
              <div className={`${className}__card-border`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const borderGlow = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

export const TrustSection = styled(Component)`
  position: relative;
  padding: 8rem 2rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.paper};

  /* Diagonal background lines */
  &__bg-line {
    position: absolute;
    width: 200%;
    height: 1px;
    pointer-events: none;
    background: linear-gradient(90deg, transparent 0%, ${({ theme }) => theme.colors.border.default} 50%, transparent 100%);

    &--1 {
      top: 20%;
      left: -50%;
      transform: rotate(-5deg);
    }

    &--2 {
      bottom: 25%;
      left: -50%;
      transform: rotate(3deg);
    }
  }

  &__container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__header {
    max-width: 600px;
    margin-bottom: 4rem;
    text-align: left;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s ease-out,
      transform 0.8s ease-out;
  }

  &.visible &__header {
    opacity: 1;
    transform: translateY(0);
  }

  &__eyebrow {
    display: inline-block;
    margin-bottom: 1rem;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: #00f5ff;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  &__title {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.02em;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  &__card {
    --accent-color: #00f5ff;
    --delay: 0s;

    position: relative;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border-radius: 20px;
    opacity: 0;
    transform: translateY(40px);
    transition:
      opacity 0.6s ease-out,
      transform 0.6s ease-out,
      box-shadow 0.3s ease;
    transition-delay: var(--delay);

    &:hover {
      box-shadow:
        0 0 40px color-mix(in srgb, var(--accent-color) 20%, transparent),
        0 20px 40px rgb(0 0 0 / 20%);
      transform: translateY(-8px);
    }
  }

  &.visible &__card {
    opacity: 1;
    transform: translateY(0);
  }

  &.visible &__card:hover {
    transform: translateY(-8px);
  }

  &__card-glow {
    position: absolute;
    top: 0;
    left: 50%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    filter: blur(40px);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
  }

  &__card:hover &__card-glow {
    opacity: 0.15;
  }

  &__card-content {
    position: relative;
    z-index: 1;
    padding: 2.5rem;
  }

  &__card-border {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 20px;
    transition: border-color 0.3s ease;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      content: '';
      background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  &__card:hover &__card-border {
    border-color: color-mix(in srgb, var(--accent-color) 40%, ${({ theme }) => theme.colors.border.default});

    &::before {
      opacity: 1;
      animation: ${borderGlow} 2s ease-in-out infinite;
    }
  }

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 1.5rem;
    color: var(--accent-color);
    background: color-mix(in srgb, var(--accent-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent-color) 30%, transparent);
    border-radius: 16px;
    transition:
      background 0.3s ease,
      transform 0.3s ease;
  }

  &__card:hover &__icon-wrapper {
    background: color-mix(in srgb, var(--accent-color) 15%, transparent);
    transform: scale(1.05);
  }

  &__card-title {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.01em;
  }

  &__card-description {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  @media (width <= 1024px) {
    &__grid {
      grid-template-columns: 1fr;
      max-width: 500px;
      margin: 0 auto;
    }
  }

  @media (width <= 768px) {
    padding: 5rem 1.5rem;

    &__header {
      margin-bottom: 3rem;
      text-align: center;
    }

    &__card-content {
      padding: 2rem;
    }

    &__bg-line {
      display: none;
    }
  }
`;
