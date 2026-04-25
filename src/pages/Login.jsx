import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === '2FA_REQUIRED') {
        setRequires2FA(true);
      } else if (err.message?.includes('expirado') || err.message?.includes('cambiar')) {
        // Redirigir a cambio de contraseña con flag de expirado
        navigate('/change-password?expired=true');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify2FA(code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
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
              <h1>Código de autenticación</h1>
              <p>Ingresa el código de 6 dígitos de tu app de autenticación</p>
            </div>
            {error && (
              <div className="login-error-animated">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleVerify2FA} className="login-form-modern">
              <div className="input-group">
                <label>Código 2FA</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    required
                    maxLength="6"
                  />
                </div>
              </div>
              <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="login-error-animated">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-modern">
            <div className="input-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="root@sistema.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <Link to="/recovery" className="forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>

            <button
              type="submit"
              className={`btn-login ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Ingresando...
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <div className="divider">
              <span>Credenciales de prueba</span>
            </div>
            <div className="credentials-box">
              <div className="credential-item">
                <Mail size={14} />
                <code>worksbinary27@gmail.com</code>
              </div>
              <div className="credential-item">
                <Lock size={14} />
                <code>Worksbin@ry27</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;