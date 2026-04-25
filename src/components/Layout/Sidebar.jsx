import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { 
  Home, Users, Shield, Key, ChevronLeft, ChevronRight,
  LogOut, Settings, ChevronDown, Cog, UserCog, AppWindow, Lock, History
} from 'lucide-react';

const Sidebar = ({ isOpen, isMobileOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();
  const role = user?.roles?.[0]?.toLowerCase();
  
  const [openMenus, setOpenMenus] = useState([]);

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => 
      prev.includes(menuId) ? prev.filter(m => m !== menuId) : [...prev, menuId]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (subItems) => subItems.some(item => location.pathname === item.path);

  // Permisos de módulos
  const canManageUsers = role === 'root' || role === 'administrador' || role === 'gestor';
  const canManageRoles = role === 'root' || role === 'administrador';
  const canManagePermissions = role === 'root';

  // Configuración: root y administrador
  const showConfig = role === 'root' || role === 'administrador';

  return (
    <aside className={`sidebar-container ${!isOpen ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/" className="brand-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brand-text" style={{ opacity: isOpen ? 1 : 0 }}>
            {settings.app_name || 'Sistema RBAC'}
          </span>
        </Link>
        <button onClick={toggleSidebar} className="sidebar-toggle">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <Home className="nav-icon" size={20} />
          <span className="nav-text">Dashboard</span>
        </Link>

        {/* Configuración */}
        {showConfig && (
          <div className="nav-group">
            <button 
              onClick={() => toggleMenu('configuracion')}
              className={`nav-item nav-parent ${isParentActive(['/config/app', '/config/password-policy', '/config/login-history']) ? 'active' : ''}`}
            >
              <Cog className="nav-icon" size={20} />
              <span className="nav-text" style={{ flex: 1, textAlign: 'left' }}>Configuración</span>
              {isOpen && (
                <ChevronDown 
                  size={16} 
                  className={`chevron-icon ${openMenus.includes('configuracion') ? 'rotate' : ''}`}
                />
              )}
            </button>
            
            {isOpen && openMenus.includes('configuracion') && (
              <div className="submenu">
                <Link to="/config/app" className={`nav-item ${isActive('/config/app') ? 'active' : ''}`}>
                  <AppWindow size={18} style={{ marginRight: '10px' }} />
                  <span>Aplicación</span>
                </Link>
                {role === 'root' && (
                  <Link to="/config/password-policy" className={`nav-item ${isActive('/config/password-policy') ? 'active' : ''}`}>
                    <Lock size={18} style={{ marginRight: '10px' }} />
                    <span>Políticas de contraseña</span>
                  </Link>
                )}
                {/* Historial de login – visible para root y administradores */}
                <Link to="/config/login-history" className={`nav-item ${isActive('/config/login-history') ? 'active' : ''}`}>
                  <History size={18} style={{ marginRight: '10px' }} />
                  <span>Historial de login</span>
                </Link>
              </div>
            )}

            {!isOpen && (
              <div className="submenu-collapsed">
                <div className="submenu-header">Configuración</div>
                <Link to="/config/app" className={`nav-item ${isActive('/config/app') ? 'active' : ''}`}>
                  <AppWindow size={16} />
                  <span>Aplicación</span>
                </Link>
                {role === 'root' && (
                  <Link to="/config/password-policy" className={`nav-item ${isActive('/config/password-policy') ? 'active' : ''}`}>
                    <Lock size={16} />
                    <span>Políticas de contraseña</span>
                  </Link>
                )}
                <Link to="/config/login-history" className={`nav-item ${isActive('/config/login-history') ? 'active' : ''}`}>
                  <History size={16} />
                  <span>Historial de login</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {(canManageUsers || canManageRoles || canManagePermissions) && (
          <div className="nav-group">
            <button 
              onClick={() => toggleMenu('autenticacion')}
              className={`nav-item nav-parent ${isParentActive(['/users', '/roles', '/permissions']) ? 'active' : ''}`}
            >
              <UserCog className="nav-icon" size={20} />
              <span className="nav-text" style={{ flex: 1, textAlign: 'left' }}>Autenticación</span>
              {isOpen && (
                <ChevronDown 
                  size={16} 
                  className={`chevron-icon ${openMenus.includes('autenticacion') ? 'rotate' : ''}`}
                />
              )}
            </button>
            
            {isOpen && openMenus.includes('autenticacion') && (
              <div className="submenu">
                {canManageUsers && (
                  <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                    <Users size={18} style={{ marginRight: '10px' }} />
                    <span>Usuarios</span>
                  </Link>
                )}
                {canManageRoles && (
                  <Link to="/roles" className={`nav-item ${isActive('/roles') ? 'active' : ''}`}>
                    <Shield size={18} style={{ marginRight: '10px' }} />
                    <span>Roles</span>
                  </Link>
                )}
                {canManagePermissions && (
                  <Link to="/permissions" className={`nav-item ${isActive('/permissions') ? 'active' : ''}`}>
                    <Key size={18} style={{ marginRight: '10px' }} />
                    <span>Permisos</span>
                  </Link>
                )}
              </div>
            )}

            {!isOpen && (
              <div className="submenu-collapsed">
                <div className="submenu-header">Autenticación</div>
                {canManageUsers && (
                  <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                    <Users size={16} />
                    <span>Usuarios</span>
                  </Link>
                )}
                {canManageRoles && (
                  <Link to="/roles" className={`nav-item ${isActive('/roles') ? 'active' : ''}`}>
                    <Shield size={16} />
                    <span>Roles</span>
                  </Link>
                )}
                {canManagePermissions && (
                  <Link to="/permissions" className={`nav-item ${isActive('/permissions') ? 'active' : ''}`}>
                    <Key size={16} />
                    <span>Permisos</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span className="logout-text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;