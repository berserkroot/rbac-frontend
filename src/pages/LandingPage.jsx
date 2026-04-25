import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Lock, LayoutDashboard, UserPlus, Award, Zap, ChevronRight } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Layout/Footer';

const LandingPage = () => {
  const { settings, loading } = useAppSettings();
  const { user } = useAuth();
  const API_URL = 'http://localhost:3001';

  // SEO dinámico sin helmet
  useEffect(() => {
    document.title = `${settings.app_name} | Gestión segura de usuarios y permisos`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${settings.app_name} es una plataforma profesional de gestión de usuarios con control de acceso basado en roles (RBAC). Seguro, escalable y fácil de uso.`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `${settings.app_name} es una plataforma profesional de gestión de usuarios con control de acceso basado en roles (RBAC). Seguro, escalable y fácil de uso.`;
      document.head.appendChild(meta);
    }
  }, [settings.app_name]);

  if (loading) {
    return (
      <div className="landing">
        <div className="landing-hero">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* Header con navegación */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-area">
            {settings.logo_url ? (
              <img
                src={`${API_URL}${settings.logo_url}`}
                alt={settings.app_name}
                className="logo-img"
                loading="eager"
              />
            ) : (
              <div className="logo-placeholder"></div>
            )}
            <h1 className="app-name">{settings.app_name}</h1>
          </div>
          <nav className="nav-links">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-outline">
                  <UserPlus size={18} />
                  <span>Registrarse</span>
                </Link>
                <Link to="/login" className="btn-primary">
                  Iniciar sesión
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero principal con animación */}
      <section className="landing-hero-modern">
        <div className="hero-container">
          <div className="hero-badge animate-fade-in">
            <Zap size={16} />
            <span>RBAC Profesional</span>
          </div>
          <h1 className="hero-title animate-slide-up">
            Gestión de usuarios <span className="gradient-text">segura y escalable</span>
          </h1>
          <p className="hero-description animate-slide-up delay-1">
            Control total sobre roles, permisos y accesos. Diseñado para empresas que priorizan la seguridad.
          </p>
          <div className="hero-buttons animate-slide-up delay-2">
            {!user && (
              <>
                <Link to="/register" className="btn-primary btn-large">
                  Comenzar ahora <ChevronRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary btn-large">
                  Iniciar sesión
                </Link>
              </>
            )}
            {user && (
              <Link to="/dashboard" className="btn-primary btn-large">
                Ir al panel <LayoutDashboard size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features grid con iconos y animaciones */}
      <section className="landing-features-modern">
        <div className="container">
          <div className="section-header">
            <h2>Características principales</h2>
            <p>Todo lo que necesitas para administrar accesos de manera profesional</p>
          </div>
          <div className="features-grid">
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <Users size={28} />
              </div>
              <h3>Gestión de Usuarios</h3>
              <p>Crea, edita y administra usuarios con diferentes niveles de acceso. Control total sobre el directorio.</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <Shield size={28} />
              </div>
              <h3>Roles Definidos</h3>
              <p>Jerarquía clara: Root, Administrador, Gestor y Usuario. Asigna roles en segundos.</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <Lock size={28} />
              </div>
              <h3>Permisos Granulares</h3>
              <p>Control detallado de cada acción: lectura, escritura, edición y eliminación por módulo.</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-wrapper">
                <Award size={28} />
              </div>
              <h3>Auditoría y trazabilidad</h3>
              <p>Registro completo de actividades y cambios para cumplir con normativas de seguridad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="landing-cta">
        <div className="cta-container">
          <h2>¿Listo para optimizar tu seguridad?</h2>
          <p>Únete a cientos de empresas que ya confían en nuestra plataforma</p>
          {!user && (
            <Link to="/register" className="btn-primary btn-large">
              Crear cuenta gratuita
            </Link>
          )}
        </div>
      </section>

      {/* Footer dinámico */}
      <Footer />
    </div>
  );
};

export default LandingPage;