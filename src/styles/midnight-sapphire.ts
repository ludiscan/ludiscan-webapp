import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

export const midnightSapphireLight: Theme = {
  name: 'Midnight Sapphire Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#2E4C8B', // Royal Blue
      dark: '#1A1F3A', // Midnight Blue
      light: '#4169B8', // Bright Sapphire
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#6B9BD1', // Sky Blue
      dark: '#4A7AA8', // Deep Sky
      light: '#8FB8E0', // Pale Sky Blue
      contrast: '#1A1F3A', // Midnight Blue
    },
    tertiary: {
      main: '#3A2D5C', // Deep Purple
      dark: '#251D3A', // Darker Purple
      light: '#5A4A7C', // Light Purple
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#EBEEF5', // Soft Blue Gray
      paper: '#F5F7FC', // Off Blue White
      elevated: '#F0F2F8', // Slight Blue Tint
      overlay: 'rgba(46, 76, 139, 0.04)', // Sapphire Tint
    },
    surface: {
      base: '#F5F7FC',
      raised: '#F0F2F8',
      sunken: '#E6EBF5',
      interactive: '#DBE3F0',
      hover: '#CFD9EB',
      pressed: '#C3CEE5',
    },
    text: {
      primary: '#1A1F3A', // Midnight Blue
      secondary: '#3A4560', // Navy Gray
      tertiary: '#5A6580', // Light Navy Gray
      disabled: '#9AA5C0', // Muted Blue
      inverse: '#FFFFFF', // White
      link: '#2E4C8B', // Royal Blue
      linkHover: '#1A1F3A', // Midnight Blue
    },
    border: {
      subtle: '#EEF2FA',
      default: '#DBE3F3',
      strong: '#C0CEEB',
      interactive: '#2E4C8B',
      focus: '#6B9BD1',
    },
    semantic: {
      success: {
        main: '#2E7D5E',
        light: '#5BC5A0',
        dark: '#1E5A40',
        contrast: '#FFFFFF',
      },
      warning: {
        main: '#D97E2A',
        light: '#FFB366',
        dark: '#B3641E',
        contrast: '#FFFFFF',
      },
      error: {
        main: '#C14C4C',
        light: '#E87A7A',
        dark: '#963838',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#4169B8',
        light: '#6B9BD1',
        dark: '#2E4C8B',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(107, 155, 209, 0.2), transparent)',
      glow: 'rgba(46, 76, 139, 0.3)',
      shadow: 'rgba(26, 31, 58, 0.1)',
      highlight: 'rgba(107, 155, 209, 0.15)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Crimson Pro", Georgia, serif',
      monospace: '"Fira Code", "JetBrains Mono", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(26, 31, 58, 0.05)',
    md: '0 4px 6px -1px rgba(26, 31, 58, 0.1), 0 2px 4px -1px rgba(26, 31, 58, 0.06)',
    lg: '0 10px 15px -3px rgba(26, 31, 58, 0.1), 0 4px 6px -2px rgba(26, 31, 58, 0.05)',
    xl: '0 20px 25px -5px rgba(26, 31, 58, 0.1), 0 10px 10px -5px rgba(26, 31, 58, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(26, 31, 58, 0.06)',
    glow: '0 0 20px rgba(107, 155, 209, 0.4)',
    primary: '0 4px 20px rgba(46, 76, 139, 0.2)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #1A1F3A 0%, #2E4C8B 100%)',
    secondary: 'linear-gradient(135deg, #6B9BD1 0%, #8FB8E0 100%)',
    sunset: 'linear-gradient(135deg, #2E4C8B 0%, #6B9BD1 50%, #8FB8E0 100%)',
    dusk: 'linear-gradient(180deg, #3A2D5C 0%, #2E4C8B 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #4169B8, #2E4C8B)',
    shimmer: 'linear-gradient(90deg, #2E4C8B 0%, #6B9BD1 50%, #2E4C8B 100%)',
  },
};

// ============================================
// MIDNIGHT SAPPHIRE - DARK THEME
// ============================================

export const midnightSapphireDark: Theme = {
  name: 'Midnight Sapphire Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#4169B8', // Bright Sapphire
      dark: '#2E4C8B', // Royal Blue
      light: '#6B9BD1', // Sky Blue
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#8FB8E0', // Pale Sky Blue
      dark: '#6B9BD1', // Sky Blue
      light: '#B3D4F0', // Light Sky
      contrast: '#0A0D1A', // Deep Black Blue
    },
    tertiary: {
      main: '#5A4A7C', // Light Purple
      dark: '#3A2D5C', // Deep Purple
      light: '#7A6A9C', // Pale Purple
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#0A0D1A', // Deep Black Blue
      paper: '#0F1328', // Navy Black
      elevated: '#151936', // Elevated Navy
      overlay: 'rgba(65, 105, 184, 0.08)', // Sapphire Overlay
    },
    surface: {
      base: '#0F1328',
      raised: '#151936',
      sunken: '#0A0D1A',
      interactive: '#1C2344',
      hover: '#242F52',
      pressed: '#2C3A60',
    },
    text: {
      primary: '#EEF2FA', // Soft White Blue
      secondary: '#C0CEEB', // Light Blue Gray
      tertiary: '#9AA5C0', // Muted Blue
      disabled: '#5A6580', // Dark Blue Gray
      inverse: '#0A0D1A', // Deep Black Blue
      link: '#6B9BD1', // Sky Blue
      linkHover: '#8FB8E0', // Pale Sky Blue
    },
    border: {
      subtle: '#1C2344',
      default: '#242F52',
      strong: '#3A4560',
      interactive: '#4169B8',
      focus: '#8FB8E0',
    },
    semantic: {
      success: {
        main: '#4ADE80',
        light: '#6EE7A0',
        dark: '#2FB560',
        contrast: '#0A0D1A',
      },
      warning: {
        main: '#FFA940',
        light: '#FFC266',
        dark: '#E68A20',
        contrast: '#0A0D1A',
      },
      error: {
        main: '#F87171',
        light: '#FCA5A5',
        dark: '#DC2626',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#6B9BD1',
        light: '#8FB8E0',
        dark: '#4169B8',
        contrast: '#0A0D1A',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(143, 184, 224, 0.15), transparent)',
      glow: 'rgba(65, 105, 184, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      highlight: 'rgba(107, 155, 209, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Crimson Pro", Georgia, serif',
      monospace: '"Fira Code", "JetBrains Mono", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
    glow: '0 0 30px rgba(65, 105, 184, 0.5), 0 0 60px rgba(65, 105, 184, 0.2)',
    primary: '0 8px 32px rgba(65, 105, 184, 0.4)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #2E4C8B 0%, #4169B8 100%)',
    secondary: 'linear-gradient(135deg, #8FB8E0 0%, #B3D4F0 100%)',
    sunset: 'linear-gradient(135deg, #3A2D5C 0%, #4169B8 50%, #8FB8E0 100%)',
    dusk: 'linear-gradient(180deg, #0A0D1A 0%, #3A2D5C 50%, #4169B8 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #6B9BD1, #2E4C8B)',
    shimmer: 'linear-gradient(90deg, #4169B8 0%, #8FB8E0 50%, #4169B8 100%)',
  },
};
