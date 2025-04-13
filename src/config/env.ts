export const env = {
  HOSTNAME: `https://${process.env.HOST_NAME ?? ''}`,
  API_BASE_URL: `https://${process.env.API_BASE_URL ?? ''}`,
} as const;
