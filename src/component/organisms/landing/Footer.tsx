import styled from '@emotion/styled';
import Link from 'next/link';

import type { FC } from 'react';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: '製品',
    links: [
      { label: 'ドキュメント', href: '/heatmap/docs/heatmap/getting-started' },
      { label: 'セキュリティ', href: '/security' },
      { label: 'ログイン', href: '/login' },
    ],
  },
  {
    title: '開発者',
    links: [{ label: 'GitHub', href: 'https://github.com/ludiscan', external: true }],
  },
];

type FooterProps = {
  className?: string;
};

const Component: FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={className}>
      {/* Background decoration */}
      <div className={`${className}__bg`}>
        <div className={`${className}__gradient`} />
        <div className={`${className}__grid-pattern`} />
      </div>

      <div className={`${className}__container`}>
        <div className={`${className}__main`}>
          {/* Brand section */}
          <div className={`${className}__brand`}>
            <Link href='/' className={`${className}__logo`}>
              <span className={`${className}__logo-icon`}>L</span>
              <span className={`${className}__logo-text`}>Ludiscan</span>
            </Link>
            <p className={`${className}__tagline`}>ゲームデータを可視化し、プレイヤーの行動からインサイトを引き出す</p>
            <div className={`${className}__social`}>
              <a href='https://github.com/ludiscan' target='_blank' rel='noopener noreferrer' className={`${className}__social-link`} aria-label='GitHub'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className={`${className}__links`}>
            {footerSections.map((section, index) => (
              <div key={index} className={`${className}__section`}>
                <h3 className={`${className}__section-title`}>{section.title}</h3>
                <ul className={`${className}__section-list`}>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className={`${className}__link`} {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}>
                        {link.label}
                        {link.external && (
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                            <polyline points='15 3 21 3 21 9' />
                            <line x1='10' y1='14' x2='21' y2='3' />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`${className}__bottom`}>
          <p className={`${className}__copyright`}>© {currentYear} Ludiscan</p>
        </div>
      </div>
    </footer>
  );
};

export const Footer = styled(Component)`
  position: relative;
  padding: 5rem 2rem 2rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.elevated};

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    background: linear-gradient(to bottom, ${({ theme }) => theme.colors.background.paper} 0%, transparent 100%);
  }

  &__grid-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(${({ theme }) => theme.colors.border.subtle}30 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.5;
  }

  &__container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__main {
    display: grid;
    grid-template-columns: 1.5fr 2fr;
    gap: 4rem;
    padding-bottom: 3rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__logo {
    display: inline-flex;
    gap: 0.75rem;
    align-items: center;
    text-decoration: none;
  }

  &__logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    font-weight: 800;
    color: #030303;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4e0 100%);
    border-radius: 10px;
  }

  &__logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.02em;
  }

  &__tagline {
    max-width: 300px;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__social {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  &__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      color: #00f5ff;
      background: ${({ theme }) => theme.colors.surface.hover};
      border-color: #00f5ff40;
      box-shadow: 0 0 20px rgb(0 245 255 / 10%);
    }
  }

  &__links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__section-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  &__section-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__link {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    transition: all 0.3s ease;

    svg {
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    &:hover {
      color: #00f5ff;

      svg {
        opacity: 1;
      }
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 1.5rem;
  }

  &__copyright {
    margin: 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  @media (width <= 1024px) {
    &__main {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    &__links {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 768px) {
    padding: 3rem 1.5rem 1.5rem;

    &__main {
      gap: 2.5rem;
      padding-bottom: 2rem;
      margin-bottom: 1.5rem;
    }

    &__links {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (width <= 480px) {
    &__links {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;
