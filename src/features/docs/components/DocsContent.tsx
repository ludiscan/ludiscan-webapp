/**
 * Docs Content Component
 * Displays the content of a documentation page with markdown rendering
 */

import styled from '@emotion/styled';
import React from 'react';

import type { DocPage } from '@src/utils/docs/types';
import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { MarkDownText } from '@src/component/molecules/MarkDownText';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';

interface DocsContentProps {
  doc: DocPage | null;
  className?: string;
}

const Component: FC<DocsContentProps> = ({ doc, className }) => {
  const { theme } = useSharedTheme();

  if (!doc) {
    return (
      <div className={className}>
        <Text text='Select a documentation page to view its content' fontSize={fontSizes.large1} color={theme.colors.text.secondary} />
      </div>
    );
  }

  return (
    <div className={className}>
      <FlexColumn gap={24}>
        {/* Header */}
        <div className={`${className}__header`}>
          <Text text={doc.frontmatter.title} fontSize={fontSizes.largest} fontWeight={fontWeights.bold} color={theme.colors.text.primary} />
          {doc.frontmatter.description && <Text text={doc.frontmatter.description} fontSize={fontSizes.large1} color={theme.colors.text.secondary} />}
        </div>

        {/* Content - Rendered with MarkDownText */}
        <div className={`${className}__content`}>
          <MarkDownText markdown={doc.content} className={`${className}__markdown`} />
        </div>
      </FlexColumn>
    </div>
  );
};

export const DocsContent = styled(Component)`
  padding: 0;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__markdown {
    font-size: ${fontSizes.medium};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.primary};

    /* Headings */
    h1 {
      padding-bottom: 8px;
      margin: 24px 0 16px;
      font-size: ${fontSizes.largest};
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
      border-bottom: 2px solid ${({ theme }) => theme.colors.border.default};

      &:first-of-type {
        margin-top: 0;
      }
    }

    h2 {
      padding-bottom: 6px;
      margin: 20px 0 12px;
      font-size: ${fontSizes.large3};
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    }

    h3 {
      margin: 16px 0 8px;
      font-size: ${fontSizes.large2};
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    h4 {
      margin: 12px 0 8px;
      font-size: ${fontSizes.large1};
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    /* Paragraphs */
    p {
      margin: 12px 0;
      line-height: 1.7;
    }

    /* Lists */
    ul,
    ol {
      padding-left: 28px;
      margin: 12px 0;

      li {
        margin: 6px 0;
        line-height: 1.6;
      }

      ul,
      ol {
        margin: 6px 0;
      }
    }

    /* Links */
    a {
      color: ${({ theme }) => theme.colors.primary.main};
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s ease;

      &:hover {
        border-bottom-color: ${({ theme }) => theme.colors.primary.main};
      }
    }

    /* Inline code */
    code {
      padding: 2px 6px;
      font-family: Consolas, Monaco, 'Courier New', monospace;
      font-size: 0.9em;
      color: ${({ theme }) => theme.colors.semantic.error.main};
      background-color: ${({ theme }) => theme.colors.surface.base};
      border-radius: 4px;
    }

    /* Code blocks */
    pre {
      padding: 16px;
      margin: 16px 0;
      overflow-x: auto;
      background-color: ${({ theme }) => theme.colors.surface.base};
      border: 1px solid ${({ theme }) => theme.colors.border.default};
      border-radius: 8px;

      code {
        padding: 0;
        font-size: ${fontSizes.small};
        color: ${({ theme }) => theme.colors.text.primary};
        background-color: transparent;
        border-radius: 0;
      }
    }

    /* Blockquotes */
    blockquote {
      padding: 12px 20px;
      margin: 16px 0;
      color: ${({ theme }) => theme.colors.text.secondary};
      background-color: ${({ theme }) => theme.colors.surface.base};
      border-left: 4px solid ${({ theme }) => theme.colors.primary.main};

      p {
        margin: 0;
      }
    }

    /* Tables */
    table {
      width: 100%;
      margin: 16px 0;
      border-collapse: collapse;
      border: 1px solid ${({ theme }) => theme.colors.border.default};

      th,
      td {
        padding: 10px 12px;
        text-align: left;
        border: 1px solid ${({ theme }) => theme.colors.border.default};
      }

      th {
        font-weight: ${fontWeights.bold};
        background-color: ${({ theme }) => theme.colors.surface.base};
      }

      tr:nth-of-type(even) {
        background-color: ${({ theme }) => theme.colors.surface.base};
      }
    }

    /* Horizontal rules */
    hr {
      margin: 24px 0;
      border: none;
      border-top: 1px solid ${({ theme }) => theme.colors.border.default};
    }

    /* Strong and emphasis */
    strong {
      font-weight: ${fontWeights.bold};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    em {
      font-style: italic;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      margin: 16px 0;
      border-radius: 8px;
    }
  }
`;
