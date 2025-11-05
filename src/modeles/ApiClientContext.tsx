import { createContext, useContext, useMemo } from 'react';

import { createClient } from '@src/modeles/qeury';

export type ApiClient = ReturnType<typeof createClient>;

// Contextの値の型定義
export type ApiClientContextValue = {
  createClient: () => ApiClient;
};

// Contextのデフォルト値（通常のAPIクライアント）
const defaultContextValue: ApiClientContextValue = {
  createClient: () => createClient(),
};

// Context本体
const ApiClientContext = createContext<ApiClientContextValue>(defaultContextValue);

// カスタムフック
export const useApiClient = () => {
  const context = useContext(ApiClientContext);
  return context.createClient();
};

// Providerコンポーネント
export type ApiClientProviderProps = {
  children: React.ReactNode;
  createClient?: () => ApiClient;
};

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children, createClient: customCreateClient }) => {
  const value = useMemo<ApiClientContextValue>(
    () => ({
      createClient: customCreateClient || (() => createClient()),
    }),
    [customCreateClient],
  );

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};
