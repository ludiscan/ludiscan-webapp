export const env = {
  HOSTNAME: process.env.NEXT_PUBLIC_HOSTNAME!,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
} as const;
