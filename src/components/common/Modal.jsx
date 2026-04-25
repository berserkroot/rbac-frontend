import { X } from 'lucide-react';
import { useEffect } from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, footer = null }) => {
  const sizes = { sm: '400px', md: '500px', lg: '600px', xl: '800px' };

  // Solo agregar el evento si el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div className="card" style={{ width: '100%', maxWidth: sizes[size], maxHeight: '90vh', overflow: 'auto', position: 'relative', margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose} style={{ borderRadius: '50%' }}>
              <X size={20} />
            </Button>
          )}
        </div>
        <div style={{ marginBottom: footer ? '24px' : 0 }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;