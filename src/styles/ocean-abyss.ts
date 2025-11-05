import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

export const oceanAbyssLight: Theme = {
  name: 'Ocean Abyss Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#2C5F7A', // Deep Teal Blue
      dark: '#1B3A52', // Deeper Navy
      light: '#3A8CAF', // Bright Ocean Blue
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#3A9E9E', // Aquamarine
      dark: '#2A7A7A', // Deep Teal
      light: '#5BC5C5', // Mint Teal
      contrast: '#FFFFFF', // White
    },
    tertiary: {
      main: '#2D3E5C', // Deep Blue Purple
      dark: '#1E2840', // Darker Navy Purple
      light: '#4A6B8A', // Slate Blue
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#F0F7FA', // Soft Sky Blue
      paper: '#FFFFFF', // Pure White
      elevated: '#FAFCFD', // Slight Blue Tint
      overlay: 'rgba(44, 95, 122, 0.05)', // Ocean Tint
    },
    surface: {
      base: '#FFFFFF',
      raised: '#F8FBFC',
      sunken: '#E8F4F8',
      interactive: '#E0F2F7',
      hover: '#D4EBF3',
      pressed: '#C5E3EF',
    },
    text: {
      primary: '#0D1B2A', // Deep Ocean Black
      secondary: '#3A5A6A', // Ocean Gray
      tertiary: '#5A7A8A', // Light Ocean Gray
      disabled: '#A0B8C5', // Muted Blue Gray
      inverse: '#FFFFFF', // White
      link: '#2C5F7A', // Deep Teal Blue
      linkHover: '#1B3A52', // Deeper Navy
    },
    border: {
      subtle: '#E8F4F8',
      default: '#D4EBF3',
      strong: '#B8DCE8',
      interactive: '#2C5F7A',
      focus: '#3A9E9E',
    },
    semantic: {
      success: {
        main: '#2E7D6E',
        light: '#5BC5B1',
        dark: '#1E5A4F',
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
        main: '#3A8CAF',
        light: '#6BB0D1',
        dark: '#2A6B8A',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(58, 158, 158, 0.2), transparent)',
      glow: 'rgba(44, 95, 122, 0.3)',
      shadow: 'rgba(13, 27, 42, 0.12)',
      highlight: 'rgba(91, 197, 197, 0.15)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Merriweather", Georgia, serif',
      monospace: '"Fira Code", "JetBrains Mono", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(13, 27, 42, 0.05)',
    md: '0 4px 6px -1px rgba(13, 27, 42, 0.1), 0 2px 4px -1px rgba(13, 27, 42, 0.06)',
    lg: '0 10px 15px -3px rgba(13, 27, 42, 0.1), 0 4px 6px -2px rgba(13, 27, 42, 0.05)',
    xl: '0 20px 25px -5px rgba(13, 27, 42, 0.1), 0 10px 10px -5px rgba(13, 27, 42, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(13, 27, 42, 0.06)',
    glow: '0 0 20px rgba(58, 158, 158, 0.4)',
    primary: '0 4px 20px rgba(44, 95, 122, 0.2)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #1B3A52 0%, #2C5F7A 100%)',
    secondary: 'linear-gradient(135deg, #3A9E9E 0%, #5BC5C5 100%)',
    sunset: 'linear-gradient(135deg, #2C5F7A 0%, #3A9E9E 50%, #5BC5C5 100%)',
    dusk: 'linear-gradient(180deg, #2D3E5C 0%, #2C5F7A 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #3A8CAF, #2C5F7A)',
    shimmer: 'linear-gradient(90deg, #2C5F7A 0%, #3A9E9E 50%, #2C5F7A 100%)',
  },
};

// ============================================
// OCEAN ABYSS - DARK THEME
// ============================================

export const oceanAbyssDark: Theme = {
  name: 'Ocean Abyss Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#3A8CAF', // Bright Ocean Blue
      dark: '#2C5F7A', // Deep Teal Blue
      light: '#5BC5E5', // Light Sky Blue
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#5BC5C5', // Mint Teal
      dark: '#3A9E9E', // Aquamarine
      light: '#7FE5E5', // Pale Teal
      contrast: '#0D1B2A', // Deep Ocean Black
    },
    tertiary: {
      main: '#4A6B8A', // Slate Blue
      dark: '#2D3E5C', // Deep Blue Purple
      light: '#6A8BAA', // Light Slate
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#0A1520', // Deep Ocean Black
      paper: '#0D1B2A', // Navy Black
      elevated: '#132838', // Elevated Navy
      overlay: 'rgba(58, 140, 175, 0.08)', // Ocean Overlay
    },
    surface: {
      base: '#0D1B2A',
      raised: '#132838',
      sunken: '#0A1520',
      interactive: '#1A3545',
      hover: '#234555',
      pressed: '#2C5565',
    },
    text: {
      primary: '#E8F4F8', // Soft White Blue
      secondary: '#B8D8E8', // Light Ocean Gray
      tertiary: '#8AB8C8', // Muted Ocean Blue
      disabled: '#5A7A8A', // Dark Ocean Gray
      inverse: '#0D1B2A', // Deep Ocean Black
      link: '#5BC5E5', // Light Sky Blue
      linkHover: '#7FE5E5', // Pale Teal
    },
    border: {
      subtle: '#1A3545',
      default: '#234555',
      strong: '#3A5A6A',
      interactive: '#3A8CAF',
      focus: '#5BC5C5',
    },
    semantic: {
      success: {
        main: '#4ADE80',
        light: '#6EE7A0',
        dark: '#2FB560',
        contrast: '#0A1520',
      },
      warning: {
        main: '#FFA940',
        light: '#FFC266',
        dark: '#E68A20',
        contrast: '#0A1520',
      },
      error: {
        main: '#F87171',
        light: '#FCA5A5',
        dark: '#DC2626',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#5BC5E5',
        light: '#7FE5E5',
        dark: '#3A8CAF',
        contrast: '#0A1520',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(91, 197, 229, 0.15), transparent)',
      glow: 'rgba(58, 140, 175, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.4)',
      highlight: 'rgba(91, 197, 197, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Merriweather", Georgia, serif',
      monospace: '"Fira Code", "JetBrains Mono", monospace',
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
    glow: '0 0 30px rgba(58, 140, 175, 0.4), 0 0 60px rgba(58, 140, 175, 0.15)',
    primary: '0 8px 32px rgba(58, 158, 158, 0.3)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #2C5F7A 0%, #3A8CAF 100%)',
    secondary: 'linear-gradient(135deg, #5BC5C5 0%, #7FE5E5 100%)',
    sunset: 'linear-gradient(135deg, #2D3E5C 0%, #3A8CAF 50%, #5BC5C5 100%)',
    dusk: 'linear-gradient(180deg, #0A1520 0%, #2D3E5C 50%, #3A8CAF 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #5BC5E5, #2C5F7A)',
    shimmer: 'linear-gradient(90deg, #3A8CAF 0%, #5BC5C5 50%, #3A8CAF 100%)',
  },
};
