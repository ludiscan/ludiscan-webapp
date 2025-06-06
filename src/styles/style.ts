export const fontSizes = {
  smallest: '10px',
  small: '12px',
  medium: '14px',
  large1: '16px',
  large2: '18px',
  large3: '20px',
  largest: '24px',
} as const;

export type FontSize = keyof typeof fontSizes;

export const fontWeights = {
  lighter: 200,
  light: 300,
  normal: 400,
  medium: 500,
  bold: 700,
  bolder: 800,
  black: 900,
} as const;

export const zIndexes = {
  content: 0,
  header: 100,
  sidebar: 150,
  modal: 200,
  dropdown: 300,
  tooltip: 400,
  loader: 500,
  toast: 600,
} as const;

export const dimensions = {
  sidebarWidth: 240,
  headerHeight: 60,
  mobileWidth: 768,
} as const;

export const colors = {
  primary: '#0070f3',
  primaryVariant: '#ff0080',
  primaryDark: '#005c9e',
  primaryLight: '#3291ff',
  white: '#fff',
  black: '#000',
  neutral01: '#f8f8f8',
  neutral02: '#f0f0f0',
  neutral03: '#e8e8e8',
  neutral04: '#e0e0e0',
  neutral05: '#d8d8d8',
  neutral06: '#d0d0d0',
  neutral07: '#c8c8c8',
  neutral08: '#c0c0c0',
  neutral09: '#b8b8b8',
  neutral10: '#b0b0b0',
  stone01: '#aaa',
  stone02: '#a2a2a2',
  stone03: '#999',
  stone04: '#888',
  stone05: '#777',
  stone06: '#666',
  stone07: '#555',
  stone08: '#444',
  stone09: '#333',
  stone10: '#222',
  stone11: '#111',
  stone12: '#0b0b0b',
  honey01: '#fffdf8',
  honey02: '#fff7e1',
  honey03: '#fff0b9',
  honey04: '#ffe175',
  honey05: '#e8ab10',
  honey06: '#b1830a',
  errorLightest: '#fff5f5',
  errorLight: '#ffa1a1',
  error: '#f94343',
} as const;
