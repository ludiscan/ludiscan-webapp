import styled from '@emotion/styled';

import { SharedThemeProvider } from '../hooks/useSharedTheme';
import theme from '../modeles/theme';
import { flattenObject } from '../utils/flattenObject';

import type { Theme } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import type { FC } from 'react';

export default {
  component: undefined,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj;

// ============================================
// COLOR SWATCHES
// ============================================

const ColorSwatch = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: ${(props) => props.bgColor};
  border-radius: 8px;
`;

const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const ColorLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const ColorValue = styled.span`
  font-family: monospace;
  font-size: 11px;
  opacity: 0.7;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

// ============================================
// TYPOGRAPHY PREVIEW
// ============================================

const TypographyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const TypographySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TypographyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// ============================================
// SPACING & SHADOWS DISPLAY
// ============================================

const SpacingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SpacingItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SpacingBox = styled.div<{ size: string }>`
  width: ${(props) => props.size};
  height: 40px;
  background-color: currentcolor;
  border-radius: 4px;
  opacity: 0.3;
`;

// ============================================
// SECTION CONTAINER
// ============================================

const ThemeSection = styled.div`
  margin-bottom: 48px;
`;

// const SectionTitle = styled.h2`
//   font-size: 24px;
//   font-weight: 700;
//   margin-bottom: 16px;
//   margin-top: 32px;
//
//   &:first-of-type {
//     margin-top: 0;
//   }
// `;

const SubsectionTitle = styled.h3`
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
`;

const ThemeModeLabel = styled.span`
  display: inline-block;
  padding: 4px 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
`;

// ============================================
// COMPONENTS
// ============================================

const ColorDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Colors</SubsectionTitle>
      <ColorGrid>
        {flattenObject(t.colors).map(({ name, value }) => {
          if (typeof value !== 'string') return null;
          return (
            <ColorItem key={name}>
              <ColorSwatch bgColor={value} />
              <ColorLabel>{name}</ColorLabel>
              <ColorValue>{value}</ColorValue>
            </ColorItem>
          );
        })}
      </ColorGrid>
    </ThemeSection>
  );
};

const TypographyDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Typography</SubsectionTitle>
      <TypographyGrid>
        <TypographySection>
          <div>
            <strong>Font Families</strong>
            {Object.entries(t.typography.fontFamily).map(([key, value]) => (
              <TypographyItem key={key}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{key}</span>
                <span style={{ fontSize: '12px', fontFamily: value as string }}>{value}</span>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>

        <TypographySection>
          <div>
            <strong>Font Sizes</strong>
            {Object.entries(t.typography.fontSize).map(([key, value]) => (
              <TypographyItem key={key}>
                <span style={{ fontSize: value as string, fontWeight: 500 }}>
                  {key}: {value}
                </span>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>
      </TypographyGrid>

      <TypographyGrid>
        <TypographySection>
          <div>
            <strong>Font Weights</strong>
            {Object.entries(t.typography.fontWeight).map(([key, value]) => (
              <TypographyItem key={key}>
                <span style={{ fontWeight: value as number }}>
                  {key}: {value}
                </span>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>

        <TypographySection>
          <div>
            <strong>Line Heights</strong>
            {Object.entries(t.typography.lineHeight).map(([key, value]) => (
              <TypographyItem key={key}>
                <span style={{ lineHeight: value as number }}>
                  {key}: {value}
                </span>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>
      </TypographyGrid>
    </ThemeSection>
  );
};

const SpacingDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Spacing</SubsectionTitle>
      <SpacingGrid>
        {Object.entries(t.spacing).map(([key, value]) => (
          <SpacingItem key={key}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{value}</div>
            </div>
            <SpacingBox size={value} />
          </SpacingItem>
        ))}
      </SpacingGrid>
    </ThemeSection>
  );
};

const ShadowsDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Shadows</SubsectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {Object.entries(t.shadows).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: '24px',
              borderRadius: '8px',
              boxShadow: value,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{key}</div>
            <div style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</div>
          </div>
        ))}
      </div>
    </ThemeSection>
  );
};

const BordersDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Borders</SubsectionTitle>
      <TypographyGrid>
        <TypographySection>
          <div>
            <strong>Border Radius</strong>
            {Object.entries(t.borders.radius).map(([key, value]) => (
              <TypographyItem key={key}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: value,
                      backgroundColor: 'currentColor',
                      opacity: 0.3,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{key}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{value}</div>
                  </div>
                </div>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>

        <TypographySection>
          <div>
            <strong>Border Width</strong>
            {Object.entries(t.borders.width).map(([key, value]) => (
              <TypographyItem key={key}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      border: `${value} solid currentColor`,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{key}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{value}</div>
                  </div>
                </div>
              </TypographyItem>
            ))}
          </div>
        </TypographySection>
      </TypographyGrid>
    </ThemeSection>
  );
};

const GradientsDisplay: FC<{ theme: Theme }> = ({ theme: t }) => {
  return (
    <ThemeSection>
      <SubsectionTitle>Gradients</SubsectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {Object.entries(t.gradients).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                width: '100%',
                height: '120px',
                background: value,
                borderRadius: '8px',
              }}
            />
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{key}</div>
            <div style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</div>
          </div>
        ))}
      </div>
    </ThemeSection>
  );
};

// ============================================
// THEME VIEWER
// ============================================

const ThemeViewer: FC<{ themeObj: Theme; mode: 'light' | 'dark' }> = ({ themeObj, mode }) => {
  return (
    <SharedThemeProvider initialTheme={themeObj}>
      <div
        style={{
          padding: '24px',
          borderRadius: '8px',
          backgroundColor: themeObj.colors.background.default,
          color: themeObj.colors.text.primary,
        }}
      >
        <ThemeModeLabel
          style={{
            backgroundColor: themeObj.colors.surface.base,
            color: themeObj.colors.text.primary,
            border: '1px solid ${themeObj.colors.border.default',
          }}
        >
          {mode.toUpperCase()}
        </ThemeModeLabel>

        <ColorDisplay theme={themeObj} />
        <TypographyDisplay theme={themeObj} />
        <SpacingDisplay theme={themeObj} />
        <ShadowsDisplay theme={themeObj} />
        <BordersDisplay theme={themeObj} />
        <GradientsDisplay theme={themeObj} />
      </div>
    </SharedThemeProvider>
  );
};

// ============================================
// STORIES
// ============================================

export const CrimsonDuskLight: Story = {
  render: () => <ThemeViewer themeObj={theme.crimsonDusk.light} mode='light' />,
  name: 'Crimson Dusk - Light',
};

export const CrimsonDuskDark: Story = {
  render: () => <ThemeViewer themeObj={theme.crimsonDusk.dark} mode='dark' />,
  name: 'Crimson Dusk - Dark',
};

export const MidnightSapphireDark: Story = {
  render: () => <ThemeViewer themeObj={theme.midnightSapphire.dark} mode='dark' />,
  name: 'Midnight Sapphire - Dark',
};

export const MidnightSapphireLight: Story = {
  render: () => <ThemeViewer themeObj={theme.midnightSapphire.light} mode='light' />,
  name: 'Midnight Sapphire - Light',
};

export const NordicNightLight: Story = {
  render: () => <ThemeViewer themeObj={theme.nordicNight.light} mode='light' />,
  name: 'Nordic Night - Light',
};

export const NordicNightDark: Story = {
  render: () => <ThemeViewer themeObj={theme.nordicNight.dark} mode='dark' />,
  name: 'Nordic Night - Dark',
};

export const BbsidianNightLight: Story = {
  render: () => <ThemeViewer themeObj={theme.obsidianNight.light} mode='light' />,
  name: 'Obsidian Night - Light',
};

export const ObsidianNightDark: Story = {
  render: () => <ThemeViewer themeObj={theme.obsidianNight.dark} mode='dark' />,
  name: 'Obsidian Night - Dark',
};

export const OceanAbyssLight: Story = {
  render: () => <ThemeViewer themeObj={theme.oceanAbyss.light} mode='light' />,
  name: 'Ocean Abyss - Light',
};

export const OceanAbyssDark: Story = {
  render: () => <ThemeViewer themeObj={theme.oceanAbyss.dark} mode='dark' />,
  name: 'Ocean Abyss - Dark',
};

export const SlateEmberLight: Story = {
  render: () => <ThemeViewer themeObj={theme.slateEmber.light} mode='light' />,
  name: 'Slate Ember - Light',
};

export const SlateEmberDark: Story = {
  render: () => <ThemeViewer themeObj={theme.slateEmber.dark} mode='dark' />,
  name: 'Slate Ember - Dark',
};
