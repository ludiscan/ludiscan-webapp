import { commonTypography, commonSpacing, commonBorders } from './commonTheme';

import type { Theme } from '@emotion/react';

// ============================================
// OBSIDIAN NIGHT - LIGHT THEME
// ============================================
export const obsidianNightLight: Theme = {
  name: 'Obsidian Night Light',
  mode: 'light',
  colors: {
    primary: {
      main: '#2D2D2D', // Slate Gray
      dark: '#1A1A1A', // Charcoal Black
      light: '#4A4A4A', // Light Charcoal
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#8E6BB8', // Amethyst
      dark: '#6A4C93', // Deep Purple
      light: '#A890D3', // Pale Amethyst
      contrast: '#FFFFFF', // White
    },
    tertiary: {
      main: '#2C5F5F', // Dark Teal
      dark: '#1E4545', // Deeper Teal
      light: '#3D7A7A', // Light Teal
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#EBEBEB', // Soft Gray
      paper: '#F5F5F5', // Off White
      elevated: '#F0F0F0', // Slight Gray Tint
      overlay: 'rgba(45, 45, 45, 0.04)', // Charcoal Tint
    },
    surface: {
      base: '#F5F5F5',
      raised: '#F0F0F0',
      sunken: '#E5E5E5',
      interactive: '#DBDBDB',
      hover: '#D0D0D0',
      pressed: '#C5C5C5',
    },
    text: {
      primary: '#1A1A1A', // Charcoal Black
      secondary: '#4A4A4A', // Medium Gray
      tertiary: '#6A6A6A', // Light Gray
      disabled: '#A0A0A0', // Muted Gray
      inverse: '#FFFFFF', // White
      link: '#6A4C93', // Deep Purple
      linkHover: '#8E6BB8', // Amethyst
    },
    border: {
      subtle: '#F0F0F0',
      default: '#E0E0E0',
      strong: '#C8C8C8',
      interactive: '#2D2D2D',
      focus: '#8E6BB8',
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
        main: '#3D7A7A',
        light: '#5FA5A5',
        dark: '#2C5F5F',
        contrast: '#FFFFFF',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(142, 107, 184, 0.2), transparent)',
      glow: 'rgba(106, 76, 147, 0.3)',
      shadow: 'rgba(26, 26, 26, 0.08)',
      highlight: 'rgba(142, 107, 184, 0.12)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Source Serif Pro", Georgia, serif',
      monospace: '"Source Code Pro", "Courier New", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(26, 26, 26, 0.05)',
    md: '0 4px 6px -1px rgba(26, 26, 26, 0.1), 0 2px 4px -1px rgba(26, 26, 26, 0.06)',
    lg: '0 10px 15px -3px rgba(26, 26, 26, 0.1), 0 4px 6px -2px rgba(26, 26, 26, 0.05)',
    xl: '0 20px 25px -5px rgba(26, 26, 26, 0.1), 0 10px 10px -5px rgba(26, 26, 26, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(26, 26, 26, 0.06)',
    glow: '0 0 20px rgba(142, 107, 184, 0.4)',
    primary: '0 4px 20px rgba(106, 76, 147, 0.2)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
    secondary: 'linear-gradient(135deg, #6A4C93 0%, #8E6BB8 100%)',
    sunset: 'linear-gradient(135deg, #2D2D2D 0%, #6A4C93 50%, #8E6BB8 100%)',
    dusk: 'linear-gradient(180deg, #2C5F5F 0%, #2D2D2D 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #8E6BB8, #6A4C93)',
    shimmer: 'linear-gradient(90deg, #2D2D2D 0%, #8E6BB8 50%, #2D2D2D 100%)',
  },
};

// ============================================
// OBSIDIAN NIGHT - DARK THEME
// ============================================

export const obsidianNightDark: Theme = {
  name: 'Obsidian Night Dark',
  mode: 'dark',
  colors: {
    primary: {
      main: '#4A4A4A', // Light Charcoal
      dark: '#2D2D2D', // Slate Gray
      light: '#6A6A6A', // Medium Gray
      contrast: '#FFFFFF', // White
    },
    secondary: {
      main: '#A890D3', // Pale Amethyst
      dark: '#8E6BB8', // Amethyst
      light: '#C8B4E8', // Light Amethyst
      contrast: '#0A0A0A', // Deep Black
    },
    tertiary: {
      main: '#3D7A7A', // Light Teal
      dark: '#2C5F5F', // Dark Teal
      light: '#5FA5A5', // Pale Teal
      contrast: '#FFFFFF', // White
    },
    background: {
      default: '#0A0A0A', // Near Black
      paper: '#121212', // Very Dark Gray
      elevated: '#1A1A1A', // Charcoal Black
      overlay: 'rgba(168, 144, 211, 0.08)', // Amethyst Overlay
    },
    surface: {
      base: '#121212',
      raised: '#1A1A1A',
      sunken: '#0A0A0A',
      interactive: '#242424',
      hover: '#2E2E2E',
      pressed: '#383838',
    },
    text: {
      primary: '#F0F0F0', // Soft White
      secondary: '#C8C8C8', // Light Gray
      tertiary: '#A0A0A0', // Medium Gray
      disabled: '#6A6A6A', // Dark Gray
      inverse: '#0A0A0A', // Near Black
      link: '#A890D3', // Pale Amethyst
      linkHover: '#C8B4E8', // Light Amethyst
    },
    border: {
      subtle: '#1A1A1A',
      default: '#242424',
      strong: '#383838',
      interactive: '#6A6A6A',
      focus: '#A890D3',
    },
    semantic: {
      success: {
        main: '#4ADE80',
        light: '#6EE7A0',
        dark: '#2FB560',
        contrast: '#0A0A0A',
      },
      warning: {
        main: '#FFA940',
        light: '#FFC266',
        dark: '#E68A20',
        contrast: '#0A0A0A',
      },
      error: {
        main: '#F87171',
        light: '#FCA5A5',
        dark: '#DC2626',
        contrast: '#FFFFFF',
      },
      info: {
        main: '#5FA5A5',
        light: '#7FC5C5',
        dark: '#3D7A7A',
        contrast: '#0A0A0A',
      },
    },
    effects: {
      shimmer: 'linear-gradient(90deg, transparent, rgba(168, 144, 211, 0.15), transparent)',
      glow: 'rgba(168, 144, 211, 0.6)',
      shadow: 'rgba(0, 0, 0, 0.8)',
      highlight: 'rgba(200, 180, 232, 0.15)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: '"Source Serif Pro", Georgia, serif',
      monospace: '"Source Code Pro", "Courier New", monospace',
    },
    ...commonTypography,
  },
  spacing: commonSpacing,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
    glow: '0 0 40px rgba(168, 144, 211, 0.4), 0 0 80px rgba(168, 144, 211, 0.15)',
    primary: '0 8px 32px rgba(142, 107, 184, 0.3)',
  },
  borders: commonBorders,
  gradients: {
    primary: 'linear-gradient(135deg, #2D2D2D 0%, #4A4A4A 100%)',
    secondary: 'linear-gradient(135deg, #A890D3 0%, #C8B4E8 100%)',
    sunset: 'linear-gradient(135deg, #2C5F5F 0%, #8E6BB8 50%, #A890D3 100%)',
    dusk: 'linear-gradient(180deg, #0A0A0A 0%, #2D2D2D 50%, #8E6BB8 100%)',
    radial: 'radial-gradient(circle at 50% 50%, #A890D3, #6A4C93)',
    shimmer: 'linear-gradient(90deg, #4A4A4A 0%, #A890D3 50%, #4A4A4A 100%)',
  },
};
