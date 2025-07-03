'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';

const ToastContext = createContext();
const DEFAULT_TOAST_DURATION = 3000;

function Toast({ message, status = '', onRemove }) {
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    const showTimeout = setTimeout(() => setVisible(true), 10);
    const hideTimeout = setTimeout(
      () => setVisible(false),
      DEFAULT_TOAST_DURATION - 300,
    );
    const removeTimeout = setTimeout(() => onRemove(), DEFAULT_TOAST_DURATION);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearTimeout(removeTimeout);
    };
  }, [onRemove]);

  const statusClass = status === 'error' ? 'toast-message--error' : '';

  return (
    <div
      className={`toast-message ${statusClass} ${visible ? 'toast-message--active' : ''} ${status === 'error' ? 'toast-message--error' : ''}`}
    >
      {message}
      <button
        className="toast-close"
        aria-label="Close"
        onClick={() => setVisible(false)}
      >
        &times;
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, status = '') => {
    const id = idRef.current++;
    setToasts((prev) => [{ id, message, status }, ...prev]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            duration={toast.duration}
            status={toast.status}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.showToast;
}
