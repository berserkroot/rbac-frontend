import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settings.service';

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    app_name: 'Sistema RBAC',
    logo_url: '',
    favicon_url: '',
    footer_text: '© 2026 Sistema RBAC. Todos los derechos reservados.'
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getPublic(); // usaremos un método público
      setSettings(prev => ({ ...prev, ...data }));
      updateDocument(data);
    } catch (err) {
      console.error('Error loading app settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = (data) => {
    if (data.app_name) {
      document.title = data.app_name;
    }
    if (data.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = `http://localhost:3001${data.favicon_url}`;
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = () => {
    loadSettings();
  };

  const value = {
    settings,
    loading,
    refreshSettings
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};