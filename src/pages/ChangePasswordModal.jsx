import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth } from '../services/api';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { Lock } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await auth.changePassword(currentPassword, newPassword);
      addToast('Contraseña actualizada correctamente', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar contraseña"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="change-password-form" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </Button>
        </>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Contraseña actual</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
            <input
              type="password"
              className="form-input"
              style={{ 
                paddingLeft: '38px',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                background: 'var(--bg)'
              }}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nueva contraseña</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
            <input
              type="password"
              className="form-input"
              style={{ 
                paddingLeft: '38px',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                background: 'var(--bg)'
              }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar nueva contraseña</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
            <input
              type="password"
              className="form-input"
              style={{ 
                paddingLeft: '38px',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                background: 'var(--bg)'
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;