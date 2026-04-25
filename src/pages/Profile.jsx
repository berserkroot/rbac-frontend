import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth, users } from '../services/api';
import { CheckCircle, XCircle, Upload, Trash2, Edit2, Save, X, User, Shield, Key } from 'lucide-react';
import RecoveryKey from './RecoveryKey';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import ChangePasswordModal from './ChangePasswordModal';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [step, setStep] = useState('initial');
  const [code, setCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [photo, setPhoto] = useState(user?.foto || '');
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('perfil');

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [deletePhotoLoading, setDeletePhotoLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    document_type: user?.document_type || '',
    document_number: user?.document_number || '',
    calle: user?.calle || '',
    numero: user?.numero || '',
    entre: user?.entre || '',
    avenida: user?.avenida || '',
    localidad: user?.localidad || '',
    municipio: user?.municipio || '',
    provincia: user?.provincia || '',
    pais_id: user?.pais?.id || user?.pais_id || ''
  });
  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setCountryLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/paises', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        console.error('Error cargando países:', err);
      } finally {
        setCountryLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    setEditData({
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      document_type: user?.document_type || '',
      document_number: user?.document_number || '',
      calle: user?.calle || '',
      numero: user?.numero || '',
      entre: user?.entre || '',
      avenida: user?.avenida || '',
      localidad: user?.localidad || '',
      municipio: user?.municipio || '',
      provincia: user?.provincia || '',
      pais_id: user?.pais?.id || user?.pais_id || ''
    });
    setTwoFactorEnabled(user?.twoFactorEnabled || false);
    setPhoto(user?.foto || '');
  }, [user]);

  const userRoles = user?.roles || user?.Roles?.map(r => r.name) || [];
  const primaryRole = userRoles[0] || 'Sin rol';

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('foto', file);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/upload/profile-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPhoto(data.foto);
      addToast('Foto actualizada correctamente', 'success');
      updateUser({ foto: data.foto });
    } catch (err) {
      addToast('Error al subir foto: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePhoto = async () => {
    setDeletePhotoLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/upload/profile-photo', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPhoto('');
      updateUser({ foto: null });
      addToast('Foto eliminada correctamente', 'success');
      setShowDeletePhotoModal(false);
    } catch (err) {
      addToast('Error al eliminar foto: ' + err.message, 'error');
    } finally {
      setDeletePhotoLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        nombres: editData.nombres,
        apellidos: editData.apellidos,
        document_type: editData.document_type,
        document_number: editData.document_number,
        calle: editData.calle,
        numero: editData.numero,
        entre: editData.entre,
        avenida: editData.avenida,
        localidad: editData.localidad,
        municipio: editData.municipio,
        provincia: editData.provincia,
        pais_id: editData.pais_id ? parseInt(editData.pais_id) : null
      };

      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.Roles && !data.roles) {
        data.roles = data.Roles.map(r => r.name);
      }

      updateUser(data);
      setIsEditing(false);
      addToast('Perfil actualizado correctamente', 'success');
    } catch (err) {
      addToast('Error al actualizar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setLoading(true);
    try {
      const response = await auth.enable2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep('setup');
      addToast('Escanea el código QR con tu app de autenticación', 'info');
    } catch (err) {
      addToast('Error al iniciar configuración: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!code) return;
    setLoading(true);
    try {
      await auth.verify2FA(code);
      setTwoFactorEnabled(true);
      setStep('initial');
      addToast('2FA activado correctamente', 'success');
      updateUser({ twoFactorEnabled: true });
    } catch (err) {
      addToast('Código inválido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDisableModal = () => {
    setDisableCode('');
    setDisableError('');
    setShowDisableModal(true);
  };

  const handleDisableConfirm = async () => {
    if (!disableCode) {
      setDisableError('Ingresa el código de 6 dígitos');
      return;
    }
    setDisableLoading(true);
    setDisableError('');
    try {
      await auth.disable2FA(disableCode);
      setTwoFactorEnabled(false);
      addToast('2FA desactivado', 'success');
      updateUser({ twoFactorEnabled: false });
      setShowDisableModal(false);
    } catch (err) {
      setDisableError(err.message || 'Código inválido');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Mi Perfil</h1>

      <div className="profile-card">
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <User size={18} />
            <span>Perfil</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'seguridad' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguridad')}
          >
            <Shield size={18} />
            <span>Seguridad</span>
          </button>
        </div>

        {activeTab === 'perfil' && (
          <div>
            <div className="profile-section">
              <h2>Foto de perfil</h2>
              <div className="photo-section">
                <div className="photo-container">
                  {photo ? (
                    <img src={`http://localhost:3001${photo}`} alt="Perfil" className="profile-photo" />
                  ) : (
                    <div className="photo-placeholder">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="photo-actions">
                  <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()} disabled={loading}>
                    <Upload size={16} /> Subir foto
                  </button>
                  {photo && (
                    <button className="btn btn-danger" onClick={() => setShowDeletePhotoModal(true)} disabled={loading}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Datos personales</h2>
                {!isEditing ? (
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading}>
                    <Edit2 size={16} /> Editar
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={handleSaveProfile} disabled={loading}>
                      <Save size={16} /> Guardar
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="edit-form">
                  <div className="form-row">
                    <Input label="Nombres" name="nombres" value={editData.nombres} onChange={handleEditChange} />
                    <Input label="Apellidos" name="apellidos" value={editData.apellidos} onChange={handleEditChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de documento</label>
                      <select name="document_type" value={editData.document_type} onChange={handleEditChange} className="form-input">
                        <option value="">Seleccionar</option>
                        <option value="CI">Cédula de identidad (CI)</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>
                    <Input label="Número de documento" name="document_number" value={editData.document_number} onChange={handleEditChange} />
                  </div>

                  <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '18px' }}>Dirección</h3>
                  <div className="form-row">
                    <Input label="Calle" name="calle" value={editData.calle} onChange={handleEditChange} />
                    <Input label="Número" name="numero" value={editData.numero} onChange={handleEditChange} />
                  </div>
                  <div className="form-row">
                    <Input label="Entre" name="entre" value={editData.entre} onChange={handleEditChange} />
                    <Input label="Avenida" name="avenida" value={editData.avenida} onChange={handleEditChange} />
                  </div>
                  <div className="form-row">
                    <Input label="Localidad" name="localidad" value={editData.localidad} onChange={handleEditChange} />
                    <Input label="Municipio" name="municipio" value={editData.municipio} onChange={handleEditChange} />
                  </div>
                  <div className="form-row">
                    <Input label="Provincia" name="provincia" value={editData.provincia} onChange={handleEditChange} />
                    <div className="form-group">
                      <label>País</label>
                      <select name="pais_id" value={editData.pais_id} onChange={handleEditChange} className="form-input" disabled={countryLoading}>
                        <option value="">Seleccionar país</option>
                        {countries.map(pais => (
                          <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <div className="info-row"><span className="label">Nombres:</span><span>{user?.nombres || '—'}</span></div>
                  <div className="info-row"><span className="label">Apellidos:</span><span>{user?.apellidos || '—'}</span></div>
                  <div className="info-row"><span className="label">Documento:</span><span>{user?.document_type ? `${user.document_type}: ${user.document_number || '—'}` : '—'}</span></div>
                  <div className="info-row"><span className="label">Dirección:</span><span>{user?.calle ? `${user.calle} ${user.numero || ''}` : '—'}</span></div>
                  <div className="info-row"><span className="label">Entre/Avenida:</span><span>{user?.entre || '—'} / {user?.avenida || '—'}</span></div>
                  <div className="info-row"><span className="label">Localidad:</span><span>{user?.localidad || '—'}</span></div>
                  <div className="info-row"><span className="label">Municipio:</span><span>{user?.municipio || '—'}</span></div>
                  <div className="info-row"><span className="label">Provincia:</span><span>{user?.provincia || '—'}</span></div>
                  <div className="info-row"><span className="label">País:</span><span>{user?.pais?.nombre || '—'}</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seguridad' && (
          <div>
            <div className="profile-section">
              <h2>Autenticación de dos factores</h2>
              <div className="info-row">
                <span className="label">Estado:</span>
                <span className="value">
                  {twoFactorEnabled ? (
                    <span className="badge-success"><CheckCircle size={16} /> Activo</span>
                  ) : (
                    <span className="badge-danger"><XCircle size={16} /> Inactivo</span>
                  )}
                </span>
              </div>
              {!twoFactorEnabled && step === 'initial' && (
                <button className="btn btn-primary" onClick={startSetup} disabled={loading}>
                  Activar 2FA
                </button>
              )}
              {step === 'setup' && (
                <div className="twofa-setup">
                  <div className="qr-container"><img src={qrCode} alt="QR Code" style={{ width: 200, height: 200 }} /></div>
                  <p>Escanea el código QR con Google Authenticator (o cualquier app TOTP).</p>
                  <p>O ingresa manualmente el secreto:</p>
                  <code className="secret-code">{secret}</code>
                  <div className="input-group">
                    <label>Código de 6 dígitos</label>
                    <input type="text" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} maxLength="6" />
                  </div>
                  <button className="btn btn-primary" onClick={verifyAndEnable} disabled={loading}>
                    {loading ? 'Verificando...' : 'Verificar y activar'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep('initial')}>
                    Cancelar
                  </button>
                </div>
              )}
              {twoFactorEnabled && (
                <button className="btn btn-danger" onClick={openDisableModal} disabled={loading}>
                  Desactivar 2FA
                </button>
              )}
            </div>

            <div className="profile-section">
              <h2>Cambio de contraseña</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowChangePasswordModal(true)}
                disabled={loading}
              >
                <Key size={16} /> Cambiar contraseña
              </button>
            </div>

            <div className="profile-section">
              <RecoveryKey />
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Desactivar autenticación de dos factores"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDisableModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDisableConfirm} disabled={disableLoading}>
              {disableLoading ? 'Verificando...' : 'Desactivar'}
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '16px' }}>
          Para desactivar la autenticación de dos factores, ingresa el código de 6 dígitos de tu app de autenticación.
        </p>
        <div className="form-group">
          <label className="form-label">Código 2FA</label>
          <input
            type="text"
            className="form-input"
            placeholder="000000"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            maxLength="6"
            autoFocus
          />
        </div>
        {disableError && <div className="alert alert-danger">{disableError}</div>}
      </Modal>

      <Modal
        isOpen={showDeletePhotoModal}
        onClose={() => setShowDeletePhotoModal(false)}
        title="Eliminar foto de perfil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeletePhotoModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDeletePhoto} disabled={deletePhotoLoading}>
              {deletePhotoLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar tu foto de perfil? Esta acción no se puede deshacer.</p>
      </Modal>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          addToast('Contraseña actualizada correctamente', 'success');
          setShowChangePasswordModal(false);
        }}
      />
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className="form-input" required={required} />
  </div>
);

export default Profile;