import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { BiLinkExternal } from 'react-icons/bi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { GitHubRelease, ReleaseResponse } from '@src/pages/api/releases.api';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type UpdateHistoryModalProps = {
  className?: string | undefined;
  isOpen: boolean;
  onClose: () => void;
};

const LAST_VIEWED_VERSION_KEY = 'ludiscan-last-viewed-version';

const Component: FC<UpdateHistoryModalProps> = ({ className, isOpen, onClose }) => {
  const { theme } = useSharedTheme();

  const {
    data: releaseData,
    isLoading,
    isError,
  } = useQuery<ReleaseResponse>({
    queryKey: ['releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });

  const releases = useMemo(() => releaseData?.releases || [], [releaseData]);

  // Mark as viewed when modal is opened
  useEffect(() => {
    if (isOpen && releases.length > 0) {
      const latestVersion = releases[0].tag_name;
      localStorage.setItem(LAST_VIEWED_VERSION_KEY, latestVersion);
    }
  }, [isOpen, releases]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal className={className} isOpen={isOpen} onClose={onClose} title='Update History' closeOutside>
      <FlexColumn className={`${className}__content`} gap={16}>
        {isLoading && (
          <div className={`${className}__loadingState`}>
            <Text text='Loading releases...' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
          </div>
        )}

        {isError && (
          <div className={`${className}__errorState`}>
            <Text text='Failed to load releases' fontSize={theme.typography.fontSize.base} color={theme.colors.semantic.error.main} />
          </div>
        )}

        {!isLoading && !isError && releases.length === 0 && (
          <div className={`${className}__emptyState`}>
            <Text text='No releases found' fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
          </div>
        )}

        {!isLoading && !isError && releases.length > 0 && (
          <FlexColumn gap={24} className={`${className}__releaseList`}>
            {releases.map((release: GitHubRelease) => (
              <div key={release.id} className={`${className}__releaseItem`}>
                <FlexRow align={'center'} gap={12} wrap={'wrap'}>
                  <Text
                    text={release.name || release.tag_name}
                    fontSize={theme.typography.fontSize.xl}
                    fontWeight={theme.typography.fontWeight.bold}
                    color={theme.colors.text.primary}
                  />
                  {release.prerelease && (
                    <span className={`${className}__prereleaseTag`}>
                      <Text
                        text='Pre-release'
                        fontSize={theme.typography.fontSize.xs}
                        fontWeight={theme.typography.fontWeight.bold}
                        color={theme.colors.text.primary}
                      />
                    </span>
                  )}
                  <Button
                    onClick={() => window.open(release.html_url, '_blank')}
                    scheme={'none'}
                    fontSize={'sm'}
                    title='View on GitHub'
                    className={`${className}__githubLink`}
                  >
                    <BiLinkExternal size={18} />
                  </Button>
                </FlexRow>

                <VerticalSpacer size={4} />

                <Text text={formatDate(release.published_at)} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />

                <VerticalSpacer size={12} />

                {release.body && (
                  <div className={`${className}__releaseBody`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{release.body}</ReactMarkdown>
                  </div>
                )}

                <Divider orientation={'horizontal'} margin={'16px 0 0 0'} />
              </div>
            ))}
          </FlexColumn>
        )}
      </FlexColumn>
    </Modal>
  );
};

export const UpdateHistoryModal = styled(Component)`
  &__content {
    width: 100%;
    max-width: 800px;
    min-width: 600px;
    max-height: 70vh;
    overflow-y: auto;

    @media (max-width: 768px) {
      min-width: unset;
      max-width: 90vw;
    }
  }

  &__loadingState,
  &__errorState,
  &__emptyState {
    padding: 32px 0;
    text-align: center;
  }

  &__releaseList {
    width: 100%;
  }

  &__releaseItem {
    width: 100%;
  }

  &__prereleaseTag {
    display: inline-block;
    padding: 2px 8px;
    background-color: ${({ theme }) => theme.colors.semantic.warning.main};
    border-radius: 4px;
  }

  &__githubLink {
    margin-left: auto;
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  &__releaseBody {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 16px;
      margin-bottom: 8px;
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    h1 {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }

    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    }

    h3 {
      font-size: ${({ theme }) => theme.typography.fontSize.base};
    }

    p {
      margin: 8px 0;
    }

    ul,
    ol {
      margin: 8px 0;
      padding-left: 24px;
    }

    li {
      margin: 4px 0;
    }

    code {
      padding: 2px 6px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      background-color: ${({ theme }) => theme.colors.surface.sunken};
      border-radius: 3px;
    }

    pre {
      padding: 12px;
      margin: 12px 0;
      overflow-x: auto;
      background-color: ${({ theme }) => theme.colors.surface.sunken};
      border-radius: 6px;

      code {
        padding: 0;
        background-color: transparent;
      }
    }

    a {
      color: ${({ theme }) => theme.colors.text.link};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    blockquote {
      padding-left: 12px;
      margin: 12px 0;
      border-left: 4px solid ${({ theme }) => theme.colors.border.strong};
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    hr {
      margin: 16px 0;
      border: none;
      border-top: 1px solid ${({ theme }) => theme.colors.border.default};
    }

    table {
      width: 100%;
      margin: 12px 0;
      border-collapse: collapse;

      th,
      td {
        padding: 8px 12px;
        text-align: left;
        border: 1px solid ${({ theme }) => theme.colors.border.default};
      }

      th {
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        background-color: ${({ theme }) => theme.colors.surface.raised};
      }
    }
  }
`;
