// ToastContext.tsx

import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

import type { Theme } from '@emotion/react';
import type { ReactNode, FC, CSSProperties } from 'react';

import { zIndexes } from '@src/styles/style';

// =======================
// 型定義
// =======================
export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number; // 表示時間(秒)
}

export interface ToastContextValue {
  showToast: (message: string, duration?: number, type?: ToastType, delay?: number) => void;
}

// =======================
// Context本体
// =======================
const ToastContext = createContext<ToastContextValue>({
  showToast: () => {
    // eslint-disable-next-line no-console
    console.warn('ToastContext not found');
  },
});

// カスタムフック
export const useToast = () => {
  return useContext(ToastContext);
};

// =======================
// Providerコンポーネント
// =======================
type ToastProviderProps = {
  children: ReactNode;
  position?: 'bottom-center' | 'bottom-right' | 'top-right' | 'top-left' | 'bottom-left';
};

let toastIdCounter = 1;

// =======================
// ToastContainer
// =======================
type ToastContainerProps = {
  toasts: ToastItem[];
  position: ToastProviderProps['position'];
};

function getPositionStyle(position: ToastProviderProps['position']): CSSProperties {
  const baseStyle: CSSProperties = {
    position: 'fixed',
    zIndex: zIndexes.toast,
    display: 'flex',
    flexDirection: 'column',
  };
  if (position === 'top-right') {
    return { ...baseStyle, top: '1.5rem', right: '1.5rem', alignItems: 'flex-end' };
  } else if (position === 'bottom-right') {
    return { ...baseStyle, bottom: '1.5rem', right: '1.5rem', alignItems: 'flex-end' };
  } else if (position === 'bottom-left') {
    return { ...baseStyle, bottom: '1.5rem', left: '1.5rem', alignItems: 'flex-start' };
  } else if (position === 'top-left') {
    return { ...baseStyle, top: '1.5rem', left: '1.5rem', alignItems: 'flex-start' };
  }
  return { ...baseStyle, bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' };
}

// トーストの色をタイプに応じて切り替え
function getBackgroundColor(theme: Theme, type: ToastType): string {
  if (type === 'success') {
    return theme.colors.semantic.success.main;
  } else if (type === 'error') {
    return theme.colors.semantic.error.main;
  } else if (type === 'warning') {
    return theme.colors.semantic.warning.main;
  }
  return theme.colors.semantic.info.main;
}

// トーストのテキスト色を取得
function getTextColor(theme: Theme, type: ToastType): string {
  if (type === 'success') {
    return theme.colors.semantic.success.contrast;
  } else if (type === 'error') {
    return theme.colors.semantic.error.contrast;
  } else if (type === 'warning') {
    return theme.colors.semantic.warning.contrast;
  }
  return theme.colors.semantic.info.contrast;
}

const ToastMessageBase = styled.div<{ $type: ToastType }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $type }) => getTextColor(theme, $type)};
  background-color: ${({ theme, $type }) => getBackgroundColor(theme, $type)};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ToastMessage = motion(ToastMessageBase);

// Get ARIA attributes based on toast type
// Error/warning: assertive (important, interrupt)
// Info/success: polite (non-urgent)
function getAriaLive(type: ToastType): 'polite' | 'assertive' {
  return type === 'error' || type === 'warning' ? 'assertive' : 'polite';
}

function getRole(type: ToastType): 'alert' | 'status' {
  return type === 'error' || type === 'warning' ? 'alert' : 'status';
}

const ToastContainer: FC<ToastContainerProps> = ({ toasts, position }) => {
  const containerStyle: CSSProperties = getPositionStyle(position);

  return (
    <div style={containerStyle}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage
            key={toast.id}
            $type={toast.type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            role={getRole(toast.type)}
            aria-live={getAriaLive(toast.type)}
            aria-atomic='true'
          >
            {toast.message}
          </ToastMessage>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const ToastProvider: FC<ToastProviderProps> = ({ children, position = 'bottom-center' }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // showToast関数
  const showToast = useCallback((message: string, duration: number = 2, type: ToastType = 'info', delay: number = 0) => {
    const id = toastIdCounter++;
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration,
    };

    // delay後に追加
    setTimeout(() => {
      setToasts((prev) => [...prev, newToast]);
      // duration後に自動削除
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration * 1000);
    }, delay * 1000);
  }, []);

  const value: ToastContextValue = {
    showToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} />
    </ToastContext.Provider>
  );
};
