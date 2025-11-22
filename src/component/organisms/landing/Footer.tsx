import styled from '@emotion/styled';
import Link from 'next/link';

import type { FC } from 'react';

type FooterProps = {
  className?: string;
};

const Component: FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={className}>
      <div className={`${className}__container`}>
        <div className={`${className}__content`}>
          <div className={`${className}__branding`}>
            <h3 className={`${className}__logo`}>Ludiscan</h3>
            <p className={`${className}__tagline`}>ゲームデータを可視化し、インサイトを提供</p>
          </div>

          <div className={`${className}__links`}>
            <div className={`${className}__links-group`}>
              <h4 className={`${className}__links-title`}>製品</h4>
              <Link href='/heatmap/docs' className={`${className}__link`}>
                ドキュメント
              </Link>
              <Link href='/login' className={`${className}__link`}>
                ログイン
              </Link>
            </div>

            <div className={`${className}__links-group`}>
              <h4 className={`${className}__links-title`}>会社</h4>
              <Link href='/security' className={`${className}__link`}>
                セキュリティ
              </Link>
              <a href='https://github.com/ludiscan' className={`${className}__link`} target='_blank' rel='noopener noreferrer'>
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className={`${className}__bottom`}>
          <p className={`${className}__copyright`}>© {currentYear} Ludiscan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export const Footer = styled(Component)`
  position: relative;
  padding: 4rem 2rem 2rem;
  background: ${({ theme }) => theme.colors.background.elevated};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    margin-bottom: 3rem;
  }

  &__branding {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__logo {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__tagline {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.8;
  }

  &__links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  &__links-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__links-title {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__link {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &__bottom {
    padding-top: 2rem;
    text-align: center;
    border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__copyright {
    margin: 0;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.7;
  }

  @media (width <= 768px) {
    padding: 3rem 1.5rem 1.5rem;

    &__content {
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    &__links {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;
