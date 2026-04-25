import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, ChevronDown, Info, AlertTriangle, XCircle, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ toggleSidebar, toggleMobile }) => {
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();
  const { theme, toggleTheme } = useTheme();
  const {
    unreadCount,
    recentNotifications = [],
    loading,
    fetchRecentNotifications,
    markAsRead,
  } = useNotifications();
  const { addToast } = useToast();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    if (typeof fetchRecentNotifications === 'function') {
      fetchRecentNotifications();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target) &&
          dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifDropdown = (e) => {
    e.stopPropagation();
    if (!notifDropdownOpen && typeof fetchRecentNotifications === 'function') {
      fetchRecentNotifications();
    }
    setNotifDropdownOpen(!notifDropdownOpen);
  };

  const handleMarkAsRead = async (id, link) => {
    if (markAsRead) await markAsRead(id);
    if (link) navigate(link);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Esto llama a /auth/logout en el servidor
    } catch (err) {
      // Ignorar error 401, igual limpiamos local
      console.log('Error en logout (puede ser normal):', err.message);
    }
    navigate('/login');
  };

  const handleLogoutAll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token ya expirado, igual procedemos a limpiar local
          addToast('Sesión ya expirada', 'info');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al cerrar sesión');
        }
      } else {
        addToast('Has cerrado sesión en todos los dispositivos', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Error al cerrar sesión en todos los dispositivos', 'error');
    } finally {
      // ✅ CORREGIDO: Limpiar localmente SIN llamar a logout() que haría otra petición
      localStorage.removeItem('user');
      // Forzar recarga para limpiar todo el estado de React
      window.location.href = '/login';
    }
  };

  const handleViewAll = () => {
    setNotifDropdownOpen(false);
    navigate('/notifications');
  };

  const isLessThan24h = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const safeNotifications = Array.isArray(recentNotifications) ? recentNotifications : [];
  const displayNotifications = safeNotifications.filter((n) => isLessThan24h(n.created_at));

  const appName = settings.app_name || 'Sistema RBAC';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleMobile}>
          <Menu size={24} />
        </button>
        <div className="breadcrumb">
          <span>{appName}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>Panel de Control</span>
        </div>
      </div>

      <div className="header-right">
        <button
          onClick={toggleTheme}
          className="notif-icon-btn"
          aria-label="Cambiar tema"
          style={{ marginRight: '4px' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="notif-wrapper" ref={notifRef}>
          <button className="notif-icon-btn" onClick={toggleNotifDropdown} aria-label="Notificaciones">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notificaciones</h3>
                {displayNotifications.length > 0 && (
                  <button className="notif-mark-all" onClick={() => {}}>
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              <div className="notif-list">
                {loading ? (
                  <div className="notif-empty">Cargando...</div>
                ) : displayNotifications.length === 0 ? (
                  <div className="notif-empty">No hay notificaciones recientes</div>
                ) : (
                  displayNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => handleMarkAsRead(notif.id, notif.link)}
                    >
                      <div className="notif-icon">{getIcon(notif.type)}</div>
                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">{formatDate(notif.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="notif-footer">
                <span className="notif-view-all" onClick={handleViewAll}>
                  Ver todas
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="user-dropdown" ref={userRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          {user?.foto ? (
            <img
              src={`${API_URL}${user.foto}`}
              alt={user.username}
              className="user-avatar-img"
            />
          ) : (
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          )}
          <span className="user-name">{user?.username}</span>
          <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? 'rotate' : ''}`} />
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu" ref={dropdownMenuRef}>
            <Link
              to="/profile"
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
              }}
            >
              <User size={16} />
              Mi perfil
            </Link>
            <button
              onClick={handleLogoutAll}
              className="dropdown-item logout-item"
            >
              <LogOut size={16} /> Cerrar sesión en todos los dispositivos
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="dropdown-item logout-item"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;