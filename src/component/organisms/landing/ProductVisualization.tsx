import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

type Feature = {
  title: string;
  description: string;
  highlight: string;
};

const features: Feature[] = [
  {
    title: '3D/2D ヒートマップ',
    description: 'プレイヤーの移動パターンを直感的に可視化',
    highlight: '立体的な分析',
  },
  {
    title: 'Route Coach',
    description: 'AIがゲームプレイの改善点を提案',
    highlight: 'AI搭載',
  },
  {
    title: 'リアルタイム分析',
    description: 'イベントログとタイムラインで詳細な追跡',
    highlight: '高速処理',
  },
];

type ProductVisualizationProps = {
  className?: string;
};

const Component: FC<ProductVisualizationProps> = ({ className }) => {
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
      { threshold: 0.2 },
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
      <div className={`${className}__container`}>
        <h2 className={`${className}__heading`}>
          ゲームデータを
          <br />
          インサイトに変える
        </h2>
        <p className={`${className}__subheading`}>プレイヤーの行動を可視化し、データドリブンな改善を実現</p>

        <div className={`${className}__visualization`}>
          <div className={`${className}__mockup`}>
            <div className={`${className}__mockup-header`}>
              <div className={`${className}__mockup-dots`}>
                <span />
                <span />
                <span />
              </div>
              <div className={`${className}__mockup-title`}>Ludiscan Heatmap Viewer</div>
            </div>
            <div className={`${className}__mockup-content`}>
              <div className={`${className}__mockup-canvas`}>
                <div className={`${className}__mockup-gradient`} />
              </div>
            </div>
          </div>
        </div>

        <div className={`${className}__features`}>
          {features.map((feature, index) => (
            <div key={index} className={`${className}__feature`} style={{ transitionDelay: `${index * 0.15}s` }}>
              <span className={`${className}__feature-highlight`}>{feature.highlight}</span>
              <h3 className={`${className}__feature-title`}>{feature.title}</h3>
              <p className={`${className}__feature-description`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProductVisualization = styled(Component)`
  position: relative;
  padding: 8rem 2rem;
  background: ${({ theme }) => theme.colors.background.default};

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  &__heading {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 700;
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.text.primary};
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s ease-out,
      transform 0.8s ease-out;
  }

  &.visible &__heading {
    opacity: 1;
    transform: translateY(0);
  }

  &__subheading {
    margin: 0 0 4rem;
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s ease-out 0.1s,
      transform 0.8s ease-out 0.1s;
  }

  &.visible &__subheading {
    opacity: 1;
    transform: translateY(0);
  }

  &__visualization {
    margin-bottom: 4rem;
    opacity: 0;
    transform: scale(0.95);
    transition:
      opacity 0.8s ease-out 0.2s,
      transform 0.8s ease-out 0.2s;
  }

  &.visible &__visualization {
    opacity: 1;
    transform: scale(1);
  }

  &__mockup {
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.background.paper};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 16px;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &__mockup-header {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: ${({ theme }) => theme.colors.background.elevated};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__mockup-dots {
    display: flex;
    gap: 0.5rem;

    span {
      width: 12px;
      height: 12px;
      background: ${({ theme }) => theme.colors.border.subtle};
      border-radius: 50%;

      &:nth-of-type(1) {
        background: #ff5f56;
      }

      &:nth-of-type(2) {
        background: #ffbd2e;
      }

      &:nth-of-type(3) {
        background: #27c93f;
      }
    }
  }

  &__mockup-title {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-align: center;
  }

  &__mockup-content {
    position: relative;
    aspect-ratio: 16 / 9;
    background: ${({ theme }) => theme.colors.background.default};
  }

  &__mockup-canvas {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__mockup-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 30% 40%,
      rgb(255 0 0 / 30%) 0%,
      rgb(255 255 0 / 20%) 30%,
      rgb(0 255 0 / 15%) 50%,
      rgb(0 0 255 / 20%) 70%,
      transparent 100%
    );
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
    }

    50% {
      opacity: 1;
    }
  }

  &__mockup-overlay {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__mockup-stat {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: ${({ theme }) => theme.colors.background.paper}dd;
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  &__mockup-stat-label {
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__mockup-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
  }

  &__feature {
    padding: 2rem;
    text-align: left;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.6s ease-out,
      transform 0.6s ease-out;
  }

  &.visible &__feature {
    opacity: 1;
    transform: translateY(0);
  }

  &__feature-highlight {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary.main};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: ${({ theme }) => theme.colors.primary.main}22;
    border-radius: 20px;
  }

  &__feature-title {
    margin: 0 0 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__feature-description {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  @media (width <= 768px) {
    padding: 4rem 1.5rem;

    &__heading {
      margin-bottom: 1rem;
    }

    &__subheading {
      margin-bottom: 2rem;
    }

    &__mockup-overlay {
      position: static;
      flex-direction: row;
      justify-content: center;
      margin-top: 1rem;
    }

    &__mockup-stat {
      flex: 1;
    }

    &__features {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;
