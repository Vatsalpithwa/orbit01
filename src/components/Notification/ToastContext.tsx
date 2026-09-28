'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
      }}>
        {toasts.map((toast) => {
          const borderColor = 
            toast.type === 'success' ? '#10b981' :
            toast.type === 'error' ? '#f43f5e' :
            toast.type === 'warning' ? '#f59e0b' : '#00f2fe';

          return (
            <div
              key={toast.id}
              style={{
                background: 'rgba(12, 18, 32, 0.95)',
                borderLeft: `4px solid ${borderColor}`,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#f8fafc',
                fontSize: '14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideIn 0.25s ease-out',
              }}
            >
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
              {toast.type === 'warning' && <AlertCircle size={18} color="#f59e0b" />}
              {toast.type === 'info' && <Info size={18} color="#00f2fe" />}
              
              <div style={{ flex: 1 }}>{toast.message}</div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
