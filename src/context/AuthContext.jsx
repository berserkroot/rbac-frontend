import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempToken, setTempToken] = useState(null);

  useEffect(() => {
    // Cargar usuario desde localStorage (para UI rápida)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Verificar sesión activa con el servidor (usa cookie)
    const checkAuth = async () => {
      try {
        const data = await auth.me();
        const processedUser = {
          ...data,
          roles: data.Roles?.map(r => r.name) || [],
          permissions: data.permissions || []
        };
        setUser(processedUser);
        localStorage.setItem('user', JSON.stringify(processedUser));
      } catch (err) {
        // Errores de autenticación (401, sesión expirada) son normales si no hay login
        const isAuthError = err.message?.includes('401') ||
                            err.message?.includes('Unauthorized') ||
                            err.message?.includes('Sesión expirada') ||
                            err.message?.includes('No hay token');
        if (isAuthError) {
          console.log('🔒 No hay sesión activa o expiró');
        } else {
          console.error('Error del servidor:', err.message);
        }
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    if (data.requires2fa) {
      setTempToken(data.tempToken);
      throw new Error('2FA_REQUIRED');
    }
    const processedUser = {
      ...data.user,
      roles: data.user.Roles?.map(r => r.name) || [],
      permissions: data.user.permissions || []
    };
    setUser(processedUser);
    localStorage.setItem('user', JSON.stringify(processedUser));
    return data;
  };

  const verify2FA = async (token) => {
    const data = await auth.verify2FALogin(tempToken, token);
    const processedUser = {
      ...data.user,
      roles: data.user.Roles?.map(r => r.name) || [],
      permissions: data.user.permissions || []
    };
    setUser(processedUser);
    setTempToken(null);
    localStorage.setItem('user', JSON.stringify(processedUser));
    return data;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      // Ignorar errores de autenticación (sesión ya expirada)
      const isAuthError = err.message?.includes('401') ||
                          err.message?.includes('Sesión expirada') ||
                          err.message?.includes('No hay token');
      if (!isAuthError) {
        console.error('Error al cerrar sesión:', err);
      }
    }
    localStorage.removeItem('user');
    setUser(null);
    setTempToken(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    if (updatedData.Roles) {
      newUser.roles = updatedData.Roles.map(r => r.name);
    }
    if (updatedData.permissions) {
      newUser.permissions = updatedData.permissions;
    }
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const hasPermission = (resource, action) => {
    if (!user) return false;
    if (user.roles?.includes('root')) return true;
    const perm = `${resource}:${action}`;
    return user.permissions?.includes(perm) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, verify2FA, logout, updateUser, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);