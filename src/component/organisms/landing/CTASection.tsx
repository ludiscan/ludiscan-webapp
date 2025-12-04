import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

type SecondaryLink = {
  label: string;
  href: string;
  external?: boolean;
};

const secondaryLinks: SecondaryLink[] = [
  {
    label: 'ドキュメント',
    href: '/heatmap/docs/heatmap/getting-started',
  },
  {
    label: 'セキュリティ',
    href: '/security',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/ludiscan/ludiscan-webapp',
    external: true,
  },
];

type CTASectionProps = {
  className?: string;
};

const Component: FC<CTASectionProps> = ({ className }) => {
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
      { threshold: 0.25 },
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
      {/* Animated background */}
      <div className={`${className}__bg`}>
        <div className={`${className}__gradient-orb ${className}__gradient-orb--1`} />
        <div className={`${className}__gradient-orb ${className}__gradient-orb--2`} />
        <div className={`${className}__gradient-orb ${className}__gradient-orb--3`} />
        <div className={`${className}__noise`} />
      </div>

      {/* Grid pattern overlay */}
      <div className={`${className}__grid`} />

      <div className={`${className}__container`}>
        <div className={`${className}__content`}>
          <span className={`${className}__eyebrow`}>Get Started</span>
          <h2 className={`${className}__heading`}>
            今すぐ
            <span className={`${className}__heading-highlight`}>始めよう</span>
          </h2>
          <p className={`${className}__subheading`}>数分でセットアップが完了。無料で全機能をお試しください。</p>

          <div className={`${className}__cta-group`}>
            <Link href='/login' className={`${className}__primary-button`}>
              <span className={`${className}__button-text`}>無料で始める</span>
              <span className={`${className}__button-glow`} />
            </Link>
          </div>

          <div className={`${className}__links`}>
            {secondaryLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`${className}__link`}
                style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
                {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <span>{link.label}</span>
                {link.external ? (
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                    <polyline points='15 3 21 3 21 9' />
                    <line x1='10' y1='14' x2='21' y2='3' />
                  </svg>
                ) : (
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <line x1='5' y1='12' x2='19' y2='12' />
                    <polyline points='12 5 19 12 12 19' />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`${className}__decoration`}>
          <div className={`${className}__ring ${className}__ring--1`} />
          <div className={`${className}__ring ${className}__ring--2`} />
          <div className={`${className}__ring ${className}__ring--3`} />
        </div>
      </div>
    </section>
  );
};

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

const float = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
`;

const ringPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
`;

const shimmer = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

export const CTASection = styled(Component)`
  position: relative;
  padding: 10rem 2rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.paper};

  &__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    animation: ${float} 20s ease-in-out infinite;

    &--1 {
      top: -20%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgb(0 245 255 / 25%) 0%, transparent 70%);
    }

    &--2 {
      bottom: -30%;
      left: -15%;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgb(168 144 211 / 20%) 0%, transparent 70%);
      animation-delay: -7s;
    }

    &--3 {
      top: 20%;
      left: 30%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgb(255 184 0 / 15%) 0%, transparent 70%);
      animation-delay: -14s;
    }
  }

  &__noise {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  &__grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(${({ theme }) => theme.colors.border.subtle}20 1px, transparent 1px),
      linear-gradient(90deg, ${({ theme }) => theme.colors.border.subtle}20 1px, transparent 1px);
    background-size: 80px 80px;
  }

  &__container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 900px;
    margin: 0 auto;
  }

  &__content {
    text-align: center;
  }

  &__eyebrow {
    display: inline-block;
    margin-bottom: 1.5rem;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: #00f5ff;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out forwards;
    animation-play-state: paused;
  }

  &.visible &__eyebrow {
    animation-play-state: running;
  }

  &__heading {
    margin: 0 0 1.5rem;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.03em;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.1s forwards;
    animation-play-state: paused;
  }

  &.visible &__heading {
    animation-play-state: running;
  }

  &__heading-highlight {
    display: inline-block;
    margin-left: 0.25em;
    background: linear-gradient(135deg, #00f5ff 0%, #a890d3 50%, #ffb800 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subheading {
    max-width: 500px;
    margin: 0 auto 3rem;
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.2s forwards;
    animation-play-state: paused;
  }

  &.visible &__subheading {
    animation-play-state: running;
  }

  &__cta-group {
    margin-bottom: 3rem;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.3s forwards;
    animation-play-state: paused;
  }

  &.visible &__cta-group {
    animation-play-state: running;
  }

  &__primary-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 3.5rem;
    overflow: hidden;
    font-size: 1.1rem;
    font-weight: 600;
    color: #030303;
    text-decoration: none;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4e0 100%);
    border: none;
    border-radius: 14px;
    box-shadow:
      0 0 40px rgb(0 245 255 / 30%),
      0 10px 40px rgb(0 245 255 / 20%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      box-shadow:
        0 0 60px rgb(0 245 255 / 50%),
        0 20px 60px rgb(0 245 255 / 30%);
      transform: translateY(-4px) scale(1.02);
    }

    &:active {
      transform: translateY(-2px) scale(1);
    }
  }

  &__button-text {
    position: relative;
    z-index: 1;
  }

  &__button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 40%) 50%, transparent 100%);
    animation: ${shimmer} 3s linear infinite;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    opacity: 0;
    animation: ${slideUp} 0.8s ease-out 0.4s forwards;
    animation-play-state: paused;
  }

  &.visible &__links {
    animation-play-state: running;
  }

  &__link {
    --delay: 0s;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    transition: all 0.3s ease;

    svg {
      transition: transform 0.3s ease;
    }

    &:hover {
      color: #00f5ff;

      svg {
        transform: translateX(3px);
      }
    }
  }

  &__decoration {
    position: absolute;
    top: 50%;
    right: -200px;
    width: 500px;
    height: 500px;
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    &--1 {
      width: 200px;
      height: 200px;
      border-color: rgb(0 245 255 / 20%);
      animation: ${ringPulse} 4s ease-in-out infinite;
    }

    &--2 {
      width: 300px;
      height: 300px;
      border-color: rgb(168 144 211 / 15%);
      animation: ${ringPulse} 4s ease-in-out infinite 1s;
    }

    &--3 {
      width: 400px;
      height: 400px;
      border-color: rgb(255 184 0 / 10%);
      animation: ${ringPulse} 4s ease-in-out infinite 2s;
    }
  }

  @media (width <= 1024px) {
    &__decoration {
      display: none;
    }
  }

  @media (width <= 768px) {
    padding: 6rem 1.5rem;

    &__heading {
      font-size: clamp(2rem, 8vw, 2.5rem);
    }

    &__heading-highlight {
      display: block;
      margin-left: 0;
    }

    &__primary-button {
      width: 100%;
      max-width: 320px;
      padding: 1rem 2rem;
    }

    &__links {
      flex-direction: column;
      gap: 1.25rem;
    }

    &__gradient-orb {
      &--1 {
        width: 300px;
        height: 300px;
      }

      &--2 {
        width: 350px;
        height: 350px;
      }

      &--3 {
        width: 200px;
        height: 200px;
      }
    }
  }
`;
