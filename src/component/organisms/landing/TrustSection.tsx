import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

type TrustItem = {
  icon: string;
  title: string;
  description: string;
};

const trustItems: TrustItem[] = [
  {
    icon: '🎮',
    title: '1000+のゲーム分析',
    description: 'モバイルからPCまで、多様なゲームジャンルで活用されています',
  },
  {
    icon: '🔒',
    title: 'エンタープライズセキュリティ',
    description: 'SOC2準拠、データ暗号化、安全なクラウドインフラストラクチャ',
  },
  {
    icon: '⚡',
    title: 'リアルタイム処理',
    description: '大規模データを高速処理し、即座にインサイトを提供します',
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className={`${className} ${isVisible ? 'visible' : ''}`}>
      <div className={`${className}__container`}>
        <div className={`${className}__grid`}>
          {trustItems.map((item, index) => (
            <div
              key={index}
              className={`${className}__item`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className={`${className}__icon`}>{item.icon}</div>
              <h3 className={`${className}__title`}>{item.title}</h3>
              <p className={`${className}__description`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TrustSection = styled(Component)`
  position: relative;
  padding: 8rem 2rem;
  background: ${({ theme }) => theme.colors.background.secondary};

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
  }

  &__item {
    padding: 2.5rem;
    background: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: 20px;
    text-align: center;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px ${({ theme }) => theme.colors.shadow.medium};
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &.visible &__item {
    opacity: 1;
    transform: translateY(0);
  }

  &__icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }

  &__title {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__description {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;

    &__grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    &__item {
      padding: 2rem;
    }
  }
`;
