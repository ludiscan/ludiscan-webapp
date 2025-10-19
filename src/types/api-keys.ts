export interface GameApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string | null;
  projects: { id: number; name: string }[];
}

export interface CreateGameApiKeyResponse {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}
