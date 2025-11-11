import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

// ============================================
// SLATE & EMBER - LIGHT THEME
// ============================================

export const slateEmberLight: Theme = {
  name: 'Slate & Ember Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#4A6072', // Blue Gray
      dark: '#3C4858', // Slate Gray
      light: '#5F7A8E', // Light Blue Gray
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#D97642', // Burning Orange
      dark: '#B85E32', // Deep Ember
      light: '#E89E5A', // Golden Amber
      contrast: '#FFFFFF', // White
    },
    tertiary: {
      main: '#5C2E3E', // Deep Wine Red
      dark: '#461F2E', // Darker Wine
      light: '#7A4558', // Light Wine
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#F5F6F8', // Soft Gray
      paper: '#FFFFFF', // Pure White
      elevated: '#FAFBFC', // Slight Gray Tint
      overlay: 'rgba(74, 96, 114, 0.04)', // Slate Tint
    },
    surface: {
      base: '#FFFFFF',
      raised: '#F9FAFC',
      sunken: '#EEF0F3',
      interactive: '#E5E8EC',
      hover: '#DBE0E5',
      pressed: '#D0D6DD',
    },
    text: {
      primary: '#2A2E35', // Deep Charcoal
      secondary: '#4A5460', // Medium Gray
      tertiary: '#6A7580', // Light Gray
      disabled: '#A0A8B0', // Muted Gray
      inverse: '#FFFFFF', // White
      link: '#D97642', // Burning Orange
      linkHover: '#B85E32', // Deep Ember
    },
    border: {
      subtle: '#EEF0F3',
      default: '#DBE0E5',
      strong: '#C0C8D0',
      interactive: '#4A6072',
      focus: '#D97642',
    },
    semantic: {
      success: {
        main: '#2E7D5E',
        light: '#5BC5A0',
        dark: '#1E5A40',
        contrast: '#FFFFFF',
      },
      warning: {
        main: '#E89E5A',
        light: '#F5C690',
        dark: '#D97642',
        contrast: '#2A2E35',
      },
      error: {
        main: '#C14C4C',
        light: '#E87A7A',
        dark: '#963838',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#5F7A8E',
        light: '#8AA0B0',
        dark: '#4A6072',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(217, 118, 66, 0.2), transparent)',
      glow: 'rgba(217, 118, 66, 0.3)',
      shadow: 'rgba(42, 46, 53, 0.1)',
      highlight: 'rgba(232, 158, 90, 0.15)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Bitter", Georgia, serif',
      monospace: '"Roboto Mono", "Courier New", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(42, 46, 53, 0.05)',
    md: '0 4px 6px -1px rgba(42, 46, 53, 0.1), 0 2px 4px -1px rgba(42, 46, 53, 0.06)',
    lg: '0 10px 15px -3px rgba(42, 46, 53, 0.1), 0 4px 6px -2px rgba(42, 46, 53, 0.05)',
    xl: '0 20px 25px -5px rgba(42, 46, 53, 0.1), 0 10px 10px -5px rgba(42, 46, 53, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(42, 46, 53, 0.06)',
    glow: '0 0 20px rgba(217, 118, 66, 0.4)',
    primary: '0 4px 20px rgba(217, 118, 66, 0.25)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #3C4858 0%, #4A6072 100%)',
    secondary: 'linear-gradient(135deg, #D97642 0%, #E89E5A 100%)',
    sunset: 'linear-gradient(135deg, #4A6072 0%, #D97642 50%, #E89E5A 100%)',
    dusk: 'linear-gradient(180deg, #5C2E3E 0%, #4A6072 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #D97642, #B85E32)',
    shimmer: 'linear-gradient(90deg, #4A6072 0%, #D97642 50%, #4A6072 100%)',
  },
};

// ============================================
// SLATE & EMBER - DARK THEME
// ============================================

export const slateEmberDark: Theme = {
  name: 'Slate & Ember Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#5F7A8E', // Light Blue Gray
      dark: '#4A6072', // Blue Gray
      light: '#8AA0B0', // Pale Blue Gray
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#E89E5A', // Golden Amber
      dark: '#D97642', // Burning Orange
      light: '#F5C690', // Pale Amber
      contrast: '#1A1C20', // Deep Black
    },
    tertiary: {
      main: '#7A4558', // Light Wine
      dark: '#5C2E3E', // Deep Wine Red
      light: '#9A6578', // Pale Wine
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#1A1C20', // Deep Charcoal
      paper: '#24272D', // Elevated Charcoal
      elevated: '#2E3238', // Higher Elevation
      overlay: 'rgba(95, 122, 142, 0.08)', // Blue Gray Overlay
    },
    surface: {
      base: '#24272D',
      raised: '#2E3238',
      sunken: '#1A1C20',
      interactive: '#383C44',
      hover: '#434750',
      pressed: '#4E525C',
    },
    text: {
      primary: '#EEF0F3', // Soft White
      secondary: '#C0C8D0', // Light Gray
      tertiary: '#9AA4B0', // Medium Gray
      disabled: '#6A7580', // Dark Gray
      inverse: '#1A1C20', // Deep Charcoal
      link: '#E89E5A', // Golden Amber
      linkHover: '#F5C690', // Pale Amber
    },
    border: {
      subtle: '#2E3238',
      default: '#383C44',
      strong: '#4E525C',
      interactive: '#5F7A8E',
      focus: '#E89E5A',
    },
    semantic: {
      success: {
        main: '#4ADE80',
        light: '#6EE7A0',
        dark: '#2FB560',
        contrast: '#1A1C20',
      },
      warning: {
        main: '#F5C690',
        light: '#FFD9B3',
        dark: '#E89E5A',
        contrast: '#1A1C20',
      },
      error: {
        main: '#F87171',
        light: '#FCA5A5',
        dark: '#DC2626',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#8AA0B0',
        light: '#A8BCC8',
        dark: '#5F7A8E',
        contrast: '#1A1C20',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(232, 158, 90, 0.15), transparent)',
      glow: 'rgba(232, 158, 90, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.4)',
      highlight: 'rgba(245, 198, 144, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Bitter", Georgia, serif',
      monospace: '"Roboto Mono", "Courier New", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    glow: '0 0 30px rgba(232, 158, 90, 0.4), 0 0 60px rgba(232, 158, 90, 0.15)',
    primary: '0 8px 32px rgba(217, 118, 66, 0.3)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #4A6072 0%, #5F7A8E 100%)',
    secondary: 'linear-gradient(135deg, #E89E5A 0%, #F5C690 100%)',
    sunset: 'linear-gradient(135deg, #5C2E3E 0%, #D97642 50%, #E89E5A 100%)',
    dusk: 'linear-gradient(180deg, #1A1C20 0%, #4A6072 50%, #D97642 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #E89E5A, #D97642)',
    shimmer: 'linear-gradient(90deg, #5F7A8E 0%, #E89E5A 50%, #5F7A8E 100%)',
  },
};
