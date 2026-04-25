import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useToast } from '../../context/ToastContext';
import { settingsService } from '../../services/settings.service';
import { Save, Upload } from 'lucide-react';

const AppConfig = () => {
  const { user } = useAuth();
  const { refreshSettings } = useAppSettings();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    app_name: '',
    logo_url: '',
    favicon_url: '',
    footer_text: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.get();
      setSettings({
        app_name: data.app_name || 'Sistema RBAC',
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
        footer_text: data.footer_text || '© 2026 Sistema RBAC. Todos los derechos reservados.'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, favicon_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);

    // Usamos credentials: 'include' para enviar la cookie de sesión
    const response = await fetch(`http://localhost:3001/api/upload/app/${type}`, {
      method: 'POST',
      credentials: 'include', // 👈 clave para autenticación con cookies
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al subir la imagen');
    }
    return data.url; // debe devolver una ruta relativa tipo '/uploads/...'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoUrl = settings.logo_url;
      let faviconUrl = settings.favicon_url;

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logo');
        setLogoFile(null);
      }
      if (faviconFile) {
        faviconUrl = await uploadImage(faviconFile, 'favicon');
        setFaviconFile(null);
      }

      const dataToSend = {
        app_name: settings.app_name,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        footer_text: settings.footer_text
      };
      await settingsService.update(dataToSend);
      addToast('Configuración guardada correctamente', 'success');
      refreshSettings();
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Configuración de la aplicación</h1>
      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la aplicación</label>
            <input
              type="text"
              name="app_name"
              value={settings.app_name}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logo</label>
            {settings.logo_url && !settings.logo_url.startsWith('data:') && (
              <div style={{ marginBottom: '8px' }}>
                <img src={`http://localhost:3001${settings.logo_url}`} alt="Logo" style={{ maxHeight: '50px' }} />
              </div>
            )}
            {settings.logo_url && settings.logo_url.startsWith('data:') && (
              <div style={{ marginBottom: '8px' }}>
                <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '50px' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            <small>Sube una imagen para el logo</small>
          </div>

          <div className="form-group">
            <label className="form-label">Favicon</label>
            {settings.favicon_url && !settings.favicon_url.startsWith('data:') && (
              <div style={{ marginBottom: '8px' }}>
                <img src={`http://localhost:3001${settings.favicon_url}`} alt="Favicon" style={{ height: '32px' }} />
              </div>
            )}
            {settings.favicon_url && settings.favicon_url.startsWith('data:') && (
              <div style={{ marginBottom: '8px' }}>
                <img src={settings.favicon_url} alt="Favicon" style={{ height: '32px' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFaviconChange} />
            <small>Sube un icono para el favicon (32x32)</small>
          </div>

          <div className="form-group">
            <label className="form-label">Texto de pie de página (footer)</label>
            <textarea
              name="footer_text"
              value={settings.footer_text}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppConfig;