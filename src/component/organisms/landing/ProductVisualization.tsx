import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

import { usePublicStats } from '@src/hooks/usePublicStats';

type Feature = {
  title: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
};

const HeatmapIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <rect x='3' y='3' width='18' height='18' rx='2' />
    <circle cx='8' cy='8' r='2' fill='currentColor' opacity='0.8' />
    <circle cx='16' cy='8' r='2' fill='currentColor' opacity='0.5' />
    <circle cx='8' cy='16' r='2' fill='currentColor' opacity='0.3' />
    <circle cx='16' cy='16' r='2' fill='currentColor' opacity='0.6' />
  </svg>
);

const AIIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <circle cx='12' cy='12' r='3' />
    <path d='M12 2v4M12 18v4M2 12h4M18 12h4' />
    <path d='M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
  </svg>
);

const TimelineIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
    <path d='M3 12h4l3-9 4 18 3-9h4' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const features: Feature[] = [
  {
    title: '3D/2D ヒートマップ',
    description: 'プレイヤーの移動パターンを直感的に可視化。立体的なデータで深い分析が可能。',
    tag: '立体的な分析',
    icon: <HeatmapIcon />,
  },
  {
    title: 'Route Coach',
    description: 'AIがゲームプレイを分析し、最適なルートや戦略を提案。',
    tag: 'AI搭載',
    icon: <AIIcon />,
  },
  {
    title: 'リアルタイム分析',
    description: 'イベントログとタイムラインで詳細な追跡。プレイの流れを完全に把握。',
    tag: '高速処理',
    icon: <TimelineIcon />,
  },
];

type ProductVisualizationProps = {
  className?: string;
};

const BACKGROUND_IMAGES = ['/preview/heatmap-preview1.png', '/preview/heatmap-preview2.png', '/preview/document-preview.png', '/preview/projects.png'];

const Component: FC<ProductVisualizationProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { data: stats } = usePublicStats();

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

  useEffect(() => {
    if (BACKGROUND_IMAGES.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section ref={sectionRef} className={`${className} ${isVisible ? 'visible' : ''}`}>
      {/* Background gradient mesh */}
      <div className={`${className}__bg-mesh`} />

      <div className={`${className}__container`}>
        <div className={`${className}__header`}>
          <span className={`${className}__eyebrow`}>Product</span>
          <h2 className={`${className}__heading`}>
            ゲームデータを
            <br />
            <span className={`${className}__heading-accent`}>インサイトに変える</span>
          </h2>
          <p className={`${className}__subheading`}>プレイヤーの行動を可視化し、データドリブンな改善を実現</p>
        </div>

        <div className={`${className}__showcase`}>
          {/* Holographic display */}
          <div className={`${className}__display`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <div className={`${className}__display-frame`}>
              {/* Scanline effect */}
              <div className={`${className}__scanline`} />

              {/* Corner decorations */}
              <div className={`${className}__corner ${className}__corner--tl`} />
              <div className={`${className}__corner ${className}__corner--tr`} />
              <div className={`${className}__corner ${className}__corner--bl`} />
              <div className={`${className}__corner ${className}__corner--br`} />

              {/* Browser mockup header */}
              <div className={`${className}__browser-header`}>
                <div className={`${className}__browser-dots`}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={`${className}__browser-url`}>
                  <span className={`${className}__browser-lock`}>🔒</span>
                  ludiscan.app/heatmap
                </div>
              </div>

              {/* Content area */}
              <div className={`${className}__display-content`}>
                <div
                  className={`${className}__display-image`}
                  style={{
                    backgroundImage: `url(${BACKGROUND_IMAGES[currentImageIndex]})`,
                  }}
                />

                {/* Image indicators */}
                <div className={`${className}__indicators`}>
                  {BACKGROUND_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      className={`${className}__indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Floating stats overlay */}
                {stats && (
                  <div className={`${className}__stats-overlay`}>
                    <div className={`${className}__stat-card`}>
                      <span className={`${className}__stat-icon`}>📊</span>
                      <div className={`${className}__stat-info`}>
                        <span className={`${className}__stat-value`}>{stats.total_sessions.toLocaleString()}</span>
                        <span className={`${className}__stat-label`}>セッション</span>
                      </div>
                    </div>
                    <div className={`${className}__stat-card`}>
                      <span className={`${className}__stat-icon`}>⚡</span>
                      <div className={`${className}__stat-info`}>
                        <span className={`${className}__stat-value`}>
                          {stats.total_events > 1000 ? `${(stats.total_events / 1000).toFixed(1)}K` : stats.total_events.toLocaleString()}
                        </span>
                        <span className={`${className}__stat-label`}>イベント</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reflection */}
            <div className={`${className}__reflection`} />
          </div>
        </div>

        {/* Features */}
        <div className={`${className}__features`}>
          {features.map((feature, index) => (
            <div key={index} className={`${className}__feature`} style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}>
              <div className={`${className}__feature-icon`}>{feature.icon}</div>
              <div className={`${className}__feature-content`}>
                <div className={`${className}__feature-tag`}>{feature.tag}</div>
                <h3 className={`${className}__feature-title`}>{feature.title}</h3>
                <p className={`${className}__feature-description`}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

export const ProductVisualization = styled(Component)`
  position: relative;
  padding: 8rem 2rem 10rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.default};

  &__bg-mesh {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgb(0 245 255 / 8%) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgb(168 144 211 / 6%) 0%, transparent 50%);
  }

  &__container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__header {
    max-width: 700px;
    margin: 0 auto 5rem;
    text-align: center;
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

  &__heading {
    margin: 0 0 1.5rem;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.15;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.02em;
  }

  &__heading-accent {
    background: linear-gradient(135deg, #00f5ff 0%, #a890d3 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subheading {
    margin: 0;
    font-size: clamp(1rem, 2vw, 1.15rem);
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__showcase {
    margin-bottom: 5rem;
    opacity: 0;
    transform: translateY(40px) perspective(1000px) rotateX(5deg);
    transition:
      opacity 0.8s ease-out 0.2s,
      transform 0.8s ease-out 0.2s;
  }

  &.visible &__showcase {
    opacity: 1;
    transform: translateY(0) perspective(1000px) rotateX(0deg);
  }

  &__display {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    animation: ${float} 6s ease-in-out infinite;

    &:hover {
      animation-play-state: paused;
    }
  }

  &__display-frame {
    position: relative;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 16px;
    box-shadow:
      0 0 0 1px ${({ theme }) => theme.colors.border.subtle},
      0 20px 60px rgb(0 0 0 / 30%),
      0 0 80px rgb(0 245 255 / 10%);
    transition: box-shadow 0.4s ease;

    &:hover {
      box-shadow:
        0 0 0 1px ${({ theme }) => theme.colors.border.default},
        0 30px 80px rgb(0 0 0 / 40%),
        0 0 100px rgb(0 245 255 / 15%);
    }
  }

  &__scanline {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent 0%, rgb(0 245 255 / 3%) 50%, transparent 100%);
    animation: ${scanline} 8s linear infinite;
  }

  &__corner {
    position: absolute;
    z-index: 5;
    width: 20px;
    height: 20px;
    border-color: #00f5ff;
    border-style: solid;
    opacity: 0.6;

    &--tl {
      top: 8px;
      left: 8px;
      border-width: 2px 0 0 2px;
      border-radius: 4px 0 0;
    }

    &--tr {
      top: 8px;
      right: 8px;
      border-width: 2px 2px 0 0;
      border-radius: 0 4px 0 0;
    }

    &--bl {
      bottom: 8px;
      left: 8px;
      border-width: 0 0 2px 2px;
      border-radius: 0 0 0 4px;
    }

    &--br {
      right: 8px;
      bottom: 8px;
      border-width: 0 2px 2px 0;
      border-radius: 0 0 4px;
    }
  }

  &__browser-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.colors.surface.raised};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__browser-dots {
    display: flex;
    gap: 6px;

    span {
      width: 12px;
      height: 12px;
      background: ${({ theme }) => theme.colors.border.default};
      border-radius: 50%;
      transition: background 0.3s ease;

      &:nth-of-type(1) {
        background: #ff5f57;
      }

      &:nth-of-type(2) {
        background: #febc2e;
      }

      &:nth-of-type(3) {
        background: #28c840;
      }
    }
  }

  &__browser-url {
    display: flex;
    flex: 1;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: 6px;
  }

  &__browser-lock {
    font-size: 0.7rem;
  }

  &__display-content {
    position: relative;
    aspect-ratio: 16 / 9;
  }

  &__display-image {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    transition: background-image 0.6s ease-in-out;
  }

  &__indicators {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  &__indicator {
    width: 8px;
    height: 8px;
    padding: 0;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.text.primary}40;
    border: none;
    border-radius: 50%;
    transition: all 0.3s ease;

    &.active {
      background: #00f5ff;
      box-shadow: 0 0 10px #00f5ff;
    }

    &:hover:not(.active) {
      background: ${({ theme }) => theme.colors.text.primary}80;
    }
  }

  &__stats-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__stat-card {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.colors.surface.base}ee;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 10px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      border-color: #00f5ff40;
      box-shadow: 0 0 20px rgb(0 245 255 / 10%);
    }
  }

  &__stat-icon {
    font-size: 1.25rem;
  }

  &__stat-info {
    display: flex;
    flex-direction: column;
  }

  &__stat-value {
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: #00f5ff;
  }

  &__stat-label {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__reflection {
    position: absolute;
    right: 5%;
    bottom: -30%;
    left: 5%;
    height: 50%;
    pointer-events: none;
    background: linear-gradient(to bottom, ${({ theme }) => theme.colors.surface.base}40 0%, transparent 100%);
    border-radius: 0 0 16px 16px;
    opacity: 0.3;
    filter: blur(2px);
    transform: scaleY(-1);
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  &__feature {
    --delay: 0s;

    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    padding: 1.5rem;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 16px;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.6s ease-out,
      transform 0.6s ease-out,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    transition-delay: var(--delay);

    &:hover {
      border-color: ${({ theme }) => theme.colors.border.default};
      box-shadow: 0 10px 40px rgb(0 0 0 / 10%);
    }
  }

  &.visible &__feature {
    opacity: 1;
    transform: translateY(0);
  }

  &__feature-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: #00f5ff;
    background: rgb(0 245 255 / 10%);
    border: 1px solid rgb(0 245 255 / 20%);
    border-radius: 12px;
  }

  &__feature-content {
    flex: 1;
  }

  &__feature-tag {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    margin-bottom: 0.75rem;
    font-size: 0.65rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.secondary.main};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: ${({ theme }) => theme.colors.secondary.main}15;
    border-radius: 4px;
  }

  &__feature-title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__feature-description {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  @media (width <= 1024px) {
    &__features {
      grid-template-columns: 1fr;
      max-width: 500px;
      margin: 0 auto;
    }
  }

  @media (width <= 768px) {
    padding: 5rem 1.5rem 6rem;

    &__header {
      margin-bottom: 3rem;
    }

    &__heading br {
      display: none;
    }

    &__showcase {
      margin-bottom: 3rem;
    }

    &__display {
      animation: none;
    }

    &__stats-overlay {
      position: static;
      flex-direction: row;
      justify-content: center;
      padding: 1rem;
    }

    &__stat-card {
      flex: 1;
      justify-content: center;
    }

    &__corner {
      display: none;
    }

    &__feature {
      padding: 1.25rem;
    }

    &__reflection {
      display: none;
    }
  }
`;
