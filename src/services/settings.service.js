const API_URL = 'http://localhost:3001/api';

// Función genérica para peticiones autenticadas con cookies
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 👈 CLAVE: enviar cookies de sesión
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
};

// Petición pública (sin autenticación) - para landing o login
const fetchPublic = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
};

export const settingsService = {
  get: () => fetchWithAuth('/settings'),       // protegido, usa cookies
  getPublic: () => fetchPublic('/settings'),   // público (si el endpoint lo permite)
  update: (data) => fetchWithAuth('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};