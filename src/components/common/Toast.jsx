import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    // Inicializar el progreso para cada toast
    const timers = {};
    toasts.forEach((toast) => {
      if (!progress[toast.id]) {
        setProgress((prev) => ({ ...prev, [toast.id]: 100 }));
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newValue = prev[toast.id] - (100 / (toast.duration / 50));
            if (newValue <= 0) {
              clearInterval(interval);
              return { ...prev, [toast.id]: 0 };
            }
            return { ...prev, [toast.id]: newValue };
          });
        }, 50);
        timers[toast.id] = interval;
      }
    });
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, [toasts]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="toast-icon-success" />;
      case 'error':
        return <XCircle size={18} className="toast-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-warning" />;
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">{getIcon(toast.type)}</div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
          <div
            className="toast-progress"
            style={{ width: `${progress[toast.id] || 0}%` }}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;