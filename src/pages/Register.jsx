import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { username, email, password } = formData;
      await auth.register({ username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <h1>Crear cuenta</h1>
            <p>Regístrate para acceder al sistema</p>
          </div>

          {error && (
            <div className="login-error-animated">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-error-animated" style={{ background: 'rgba(34,197,94,0.2)', borderColor: '#22c55e', color: '#86efac' }}>
              <CheckCircle size={18} />
              <span>¡Registro exitoso! Redirigiendo al login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-modern">
            <div className="input-group">
              <label>Nombre de usuario</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="juanperez"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirmar contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-login ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="demo-credentials" style={{ marginTop: '24px' }}>
            <div className="divider">
              <span>¿Ya tienes cuenta?</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;