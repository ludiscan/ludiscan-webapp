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
    href: '/heatmap/docs',
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
      { threshold: 0.3 },
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
        <h2 className={`${className}__heading`}>今すぐ始めよう</h2>
        <p className={`${className}__subheading`}>数分でセットアップ完了。クレジットカード不要でお試しいただけます</p>

        <div className={`${className}__primary-cta`}>
          <Link href='/login' className={`${className}__primary-button`}>
            無料トライアルを開始
          </Link>
        </div>

        <div className={`${className}__secondary-links`}>
          {secondaryLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`${className}__secondary-link`}
              {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {link.label}
              {link.external && ' ↗'}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const CTASection = styled(Component)`
  position: relative;
  padding: 8rem 2rem;
  text-align: center;
  background: ${({ theme }) => theme.colors.background.paper};

  &__container {
    max-width: 800px;
    margin: 0 auto;
  }

  &__heading {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
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
    margin: 0 0 3rem;
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

  &__primary-cta {
    margin-bottom: 2rem;
    opacity: 0;
    transform: scale(0.95);
    transition:
      opacity 0.8s ease-out 0.2s,
      transform 0.8s ease-out 0.2s;
  }

  &.visible &__primary-cta {
    opacity: 1;
    transform: scale(1);
  }

  &__primary-button {
    display: inline-block;
    padding: 1.25rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.background.default};
    text-decoration: none;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50px;
    box-shadow: 0 10px 30px rgb(0 112 243 / 30%);
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primary.light};
      box-shadow: 0 15px 40px rgb(0 112 243 / 40%);
      transform: translateY(-3px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__secondary-links {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.8s ease-out 0.3s,
      transform 0.8s ease-out 0.3s;
  }

  &.visible &__secondary-links {
    opacity: 1;
    transform: translateY(0);
  }

  &__secondary-link {
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  @media (width <= 768px) {
    padding: 4rem 1.5rem;

    &__heading {
      margin-bottom: 1rem;
    }

    &__subheading {
      margin-bottom: 2rem;
    }

    &__primary-button {
      width: 100%;
      max-width: 350px;
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    &__secondary-links {
      flex-direction: column;
      gap: 1rem;
    }
  }
`;
