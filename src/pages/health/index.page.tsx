import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { useHealthCheck } from '@src/hooks/useHealthCheck';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes, fontWeights } from '@src/styles/style';

export type HealthPageProps = {
  className?: string;
};

const Component: FC<HealthPageProps> = ({ className }) => {
  const router = useRouter();
  const { theme } = useSharedTheme();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const {
    data,
    isLoading: healthLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useHealthCheck({
    refetchInterval: autoRefresh ? 30000 : undefined,
    enabled: autoRefresh,
  });

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    refetch();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  const getStatusColor = (status: string | undefined) => {
    if (status === 'up') return theme.colors.semantic.success.main;
    if (status === 'down') return theme.colors.semantic.error.main;
    return theme.colors.text.secondary;
  };

  const getStatusBackgroundColor = (status: string | undefined) => {
    if (status === 'up') return theme.colors.semantic.success.light;
    if (status === 'down') return theme.colors.semantic.error.light;
    return theme.colors.surface.base;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const overallStatus = data?.status || 'unknown';
  const details = data?.details || {};
  const hasErrors = overallStatus === 'error' || Object.values(details).some((detail) => detail.status === 'down');

  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title='System Health Check' onClick={handleBack} />

        <div className={`${className}__container`}>
          {/* Overall Status Card */}
          <Card blur color={theme.colors.surface.base} className={`${className}__card`}>
            <FlexRow gap={16} align='center'>
              <FlexColumn gap={8}>
                <Text text='Overall Status' fontSize={fontSizes.large2} color={theme.colors.text.primary} fontWeight={fontWeights.bold} />
                <FlexRow gap={12} align='center'>
                  <div
                    className={`${className}__statusBadge`}
                    style={{
                      backgroundColor: getStatusBackgroundColor(hasErrors ? 'down' : 'up'),
                      borderColor: getStatusColor(hasErrors ? 'down' : 'up'),
                    }}
                  >
                    <Text
                      text={hasErrors ? 'Degraded' : 'Healthy'}
                      fontSize={fontSizes.small}
                      color={getStatusColor(hasErrors ? 'down' : 'up')}
                      fontWeight={fontWeights.bold}
                    />
                  </div>
                  {dataUpdatedAt && (
                    <Text
                      text={`Last updated: ${formatTimestamp(dataUpdatedAt)}`}
                      fontSize={fontSizes.small}
                      color={theme.colors.text.secondary}
                      fontWeight='lighter'
                    />
                  )}
                </FlexRow>
              </FlexColumn>
              <FlexRow gap={12}>
                <Button onClick={toggleAutoRefresh} scheme={autoRefresh ? 'primary' : 'surface'} fontSize='sm'>
                  {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
                </Button>
                <Button onClick={handleRefresh} disabled={healthLoading} scheme='secondary' fontSize='sm'>
                  {healthLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </FlexRow>
            </FlexRow>
          </Card>

          <VerticalSpacer size={24} />

          {/* Error Message */}
          {error && (
            <>
              <Card blur color={theme.colors.semantic.error.light} className={`${className}__card`}>
                <FlexRow gap={12} align='center'>
                  <div className={`${className}__errorIcon`}>!</div>
                  <FlexColumn gap={4}>
                    <Text
                      text='Failed to fetch health status'
                      fontSize={fontSizes.medium}
                      color={theme.colors.semantic.error.main}
                      fontWeight={fontWeights.bold}
                    />
                    <Text text={error.message || 'Unknown error'} fontSize={fontSizes.small} color={theme.colors.semantic.error.dark} fontWeight='lighter' />
                  </FlexColumn>
                </FlexRow>
              </Card>
              <VerticalSpacer size={24} />
            </>
          )}

          {/* Service Status Cards */}
          {healthLoading && !data ? (
            <Card blur color={theme.colors.surface.base} className={`${className}__card`}>
              <div className={`${className}__centerContent`}>
                <Text text='Loading health status...' fontSize={fontSizes.medium} color={theme.colors.text.secondary} />
              </div>
            </Card>
          ) : (
            <div className={`${className}__servicesGrid`}>
              {Object.entries(details).map(([serviceName, serviceDetails]) => {
                const status = serviceDetails.status;
                const statusColor = getStatusColor(status);
                const statusBgColor = getStatusBackgroundColor(status);

                return (
                  <Card key={serviceName} blur color={theme.colors.surface.base} className={`${className}__serviceCard`}>
                    <FlexColumn gap={12} align={'center'}>
                      <FlexRow gap={12} align='center'>
                        <Text
                          text={serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}
                          fontSize={fontSizes.large1}
                          color={theme.colors.text.primary}
                          fontWeight={fontWeights.bold}
                        />
                        <div
                          className={`${className}__statusIndicator`}
                          style={{
                            backgroundColor: statusColor,
                            boxShadow: `0 0 8px ${statusColor}40`,
                          }}
                        />
                      </FlexRow>

                      <div
                        className={`${className}__statusBadge`}
                        style={{
                          backgroundColor: statusBgColor,
                          borderColor: statusColor,
                        }}
                      >
                        <Text text={status.toUpperCase()} fontSize={fontSizes.small} color={statusColor} fontWeight={fontWeights.bold} />
                      </div>

                      {/* Additional Details */}
                      {Object.entries(serviceDetails)
                        .filter(([key]) => key !== 'status')
                        .map(([key, value]) => (
                          <div key={key} className={`${className}__detailRow`}>
                            <Text text={`${key}:`} fontSize={fontSizes.small} color={theme.colors.text.secondary} fontWeight='lighter' />
                            <Text text={String(value)} fontSize={fontSizes.small} color={theme.colors.text.primary} fontWeight='lighter' />
                          </div>
                        ))}
                    </FlexColumn>
                  </Card>
                );
              })}
            </div>
          )}

          {!healthLoading && data && Object.keys(details).length === 0 && (
            <Card blur color={theme.colors.surface.base} className={`${className}__card`}>
              <div className={`${className}__centerContent`}>
                <Text text='No service details available' fontSize={fontSizes.medium} color={theme.colors.text.secondary} />
              </div>
            </Card>
          )}
        </div>
      </InnerContent>
    </div>
  );
};

const HealthPage = styled(Component)`
  height: 100vh;

  &__container {
    max-width: 800px;
    padding: 12px 24px;
    margin-bottom: 24px;
  }

  &__card {
    padding: 24px;
  }

  &__serviceCard {
    padding: 20px;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-2px);
    }
  }

  &__servicesGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  &__statusBadge {
    display: inline-flex;
    padding: 6px 12px;
    border: 1px solid;
    border-radius: 16px;
    backdrop-filter: blur(8px);
  }

  &__statusIndicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }

  &__centerContent {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  &__errorIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 20px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.semantic.error.contrast};
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
    border-radius: 50%;
  }

  &__detailRow {
    display: flex;
    gap: 8px;
    padding: 4px 0;
  }
`;

export default HealthPage;
