// ToastContext.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

import type { ReactNode, FC, CSSProperties } from 'react';

import { colors, zIndexes } from '@/styles/style.ts';

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

function getPositionStyle(position: ToastProviderProps['position']): React.CSSProperties {
  const baseStyle: CSSProperties = {
    position: 'fixed',
    zIndex: zIndexes.toast,
    display: 'flex',
    flexDirection: 'column',
  };
  if (position === 'top-right') {
    return { ...baseStyle, top: 20, right: 20, alignItems: 'flex-end' };
  } else if (position === 'bottom-right') {
    return { ...baseStyle, bottom: 20, right: 20, alignItems: 'flex-end' };
  } else if (position === 'bottom-left') {
    return { ...baseStyle, bottom: 20, left: 20, alignItems: 'flex-start' };
  } else if (position === 'top-left') {
    return { ...baseStyle, top: 20, left: 20, alignItems: 'flex-start' };
  }
  return { ...baseStyle, bottom: 20, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' };
}

// トーストの色をタイプに応じて切り替え
function getBackgroundColor(type: ToastType): string {
  if (type === 'success') {
    return colors.primary;
  } else if (type === 'error') {
    return colors.error;
  } else if (type === 'warning') {
    return colors.honey05;
  }
  return colors.white;
}

const ToastContainer: FC<ToastContainerProps> = ({ toasts, position }) => {
  const containerStyle: CSSProperties = getPositionStyle(position);

  return (
    <div style={containerStyle}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: getBackgroundColor(toast.type),
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 4,
              marginTop: 8,
              // 位置によってmarginが上ではなく下に必要なら適宜調整
            }}
          >
            {toast.message}
          </motion.div>
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
