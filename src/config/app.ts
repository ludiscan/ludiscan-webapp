/**
 * Application constants and metadata
 */
export const APP_INFO = {
  name: 'Ludiscan',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
  author: 'matuyuhi',
  description: 'Player position tracking and heatmap visualization tool',
  repository: 'https://github.com/ludiscan/ludiscan-webapp',
  organization: 'https://github.com/ludiscan',
  documentation: 'https://ludiscan.github.io/ludiscan-webapp',
} as const;
