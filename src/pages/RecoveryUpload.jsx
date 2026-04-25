import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { ArrowLeft, Lock, FileText, AlertCircle, Upload } from 'lucide-react';
import '../styles/login.css';

const RecoveryUpload = () => {
  const [file, setFile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !newPassword || !confirmPassword) {
      setMessage('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      try {
        await auth.resetWithRecoveryFile(base64, newPassword);
        setMessage('✅ Contraseña actualizada correctamente. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setMessage('❌ Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="login-page-animated">
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <Link to="/" className="back-to-landing">
        <ArrowLeft size={20} />
        <span>Volver al inicio</span>
      </Link>

      <div className="login-container">
        <div className="login-card-glass">
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo.png" alt="Logo" className="logo-image" />
            </div>
            <h1>Restablecer contraseña</h1>
            <p>Sube tu archivo de recuperación y elige una nueva contraseña</p>
          </div>

          {message && (
            <div className="login-error-animated">
              <AlertCircle size={18} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-modern">
            <div className="input-group">
              <label>Archivo de recuperación</label>
              <div className="input-wrapper">
                <FileText size={18} className="input-icon" />
                <input
                  type="text"
                  value={file ? file.name : 'No se ha seleccionado ningún archivo'}
                  readOnly
                  placeholder="Selecciona tu archivo de recuperación"
                  className="form-input"
                  style={{ paddingLeft: '48px', cursor: 'default' }}
                />
                <button
                  type="button"
                  className="btn-file-select"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={16} /> Elegir archivo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Nueva contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirmar contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  'Restablecer contraseña'
                )}
              </button>
              <Link
                to="/login"
                className="btn-login"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <ArrowLeft size={18} />
                Volver al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoveryUpload;