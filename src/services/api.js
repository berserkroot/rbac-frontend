const API_URL = 'http://localhost:3001/api';

// ----------------------------------------------------------------------
// 1. Peticiones públicas (sin cookies, ej. registro público)
// ----------------------------------------------------------------------
const fetchPublic = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

// ----------------------------------------------------------------------
// 2. Peticiones de login y verificación 2FA (necesitan enviar/recibir cookies)
// ----------------------------------------------------------------------
const fetchLogin = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

// ----------------------------------------------------------------------
// 3. Peticiones autenticadas (requieren cookie de sesión)
// ----------------------------------------------------------------------
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (!response.ok) {
    // Si la sesión expiró o es inválida, limpiamos estado y redirigimos
    if (response.status === 401) {
      localStorage.removeItem('user');
      // Evitamos redirigir si ya estamos en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

// ----------------------------------------------------------------------
// Servicio de autenticación
// ----------------------------------------------------------------------
export const auth = {
  login: async (email, password) => {
    return fetchLogin('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (data) => fetchPublic('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  me: () => fetchWithAuth('/auth/me'),

  enable2FA: () => fetchWithAuth('/auth/enable-2fa', { method: 'POST' }),

  verify2FA: (token) => fetchWithAuth('/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ token }) }),

  disable2FA: (token) => fetchWithAuth('/auth/disable-2fa', { method: 'POST', body: JSON.stringify({ token }) }),

  verify2FALogin: async (tempToken, token) => {
    return fetchLogin('/auth/verify-2fa-login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, token }),
    });
  },

  changePassword: (currentPassword, newPassword) =>
    fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => fetchWithAuth('/auth/logout', { method: 'POST' }),

  resetWithRecoveryFile: async (fileBase64, newPassword) => {
    return fetchPublic('/auth/reset-with-recovery-file', {
      method: 'POST',
      body: JSON.stringify({ token: fileBase64, newPassword }),
    });
  },
};

// ----------------------------------------------------------------------
// Usuarios
// ----------------------------------------------------------------------
export const users = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => fetchWithAuth(`/users/${id}`),
  create: (data) => fetchWithAuth('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/users/${id}`, { method: 'DELETE' }),
};

// ----------------------------------------------------------------------
// Roles
// ----------------------------------------------------------------------
export const roles = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/roles${query ? `?${query}` : ''}`);
  },
  create: (data) => fetchWithAuth('/roles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/roles/${id}`, { method: 'DELETE' }),
};

// ----------------------------------------------------------------------
// Permisos
// ----------------------------------------------------------------------
export const permissions = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/permissions${query ? `?${query}` : ''}`);
  },
  create: (data) => fetchWithAuth('/permissions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/permissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/permissions/${id}`, { method: 'DELETE' }),
};

// ----------------------------------------------------------------------
// Política de contraseñas
// ----------------------------------------------------------------------
export const passwordPolicy = {
  get: () => fetchWithAuth('/password-policy'),
  update: (data) => fetchWithAuth('/password-policy', { method: 'PUT', body: JSON.stringify(data) }),
};

// ----------------------------------------------------------------------
// Historial de login
// ----------------------------------------------------------------------
export const loginHistory = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/login-history${query ? `?${query}` : ''}`);
  },
};

export default {
  auth,
  users,
  roles,
  permissions,
  passwordPolicy,
  loginHistory,
};