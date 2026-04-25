import { useState, useEffect, useRef } from 'react';
import { users, roles as rolesApi } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API_URL = 'http://localhost:3001/api';

const UserForm = ({ userId, onClose, onSave }) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    isActive: true,
    roles: [],
    document_type: '',
    document_number: '',
    calle: '',
    numero: '',
    entre: '',
    avenida: '',
    localidad: '',
    municipio: '',
    provincia: '',
    pais_id: '',
    foto: null,
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const userLevel = Math.max(...(currentUser?.Roles?.map(r => r.level) || []), 0);

  useEffect(() => {
    loadRoles();
    loadPaises();
    if (userId) {
      setIsEdit(true);
      loadUser(userId);
    }
  }, [userId]);

  const loadRoles = async () => {
    try {
      const data = await rolesApi.getAll();
      const rolesArray = data.data || data;
      const filteredRoles = rolesArray.filter(role => role.level <= userLevel);
      setAvailableRoles(filteredRoles);
    } catch (err) {
      console.error('Error cargando roles:', err);
      addToast('Error al cargar roles', 'error');
    }
  };

  const loadPaises = async () => {
    try {
      // ✅ CORREGIDO: Usar fetch con credentials para enviar la cookie automáticamente
      const response = await fetch(`${API_URL}/paises`, {
        credentials: 'include', // 👈 Enviar cookie HttpOnly automáticamente
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
        throw new Error('Error al cargar países');
      }
      
      const data = await response.json();
      const paisesArray = Array.isArray(data) ? data : (data.data ? data.data : []);
      setPaises(paisesArray);
    } catch (err) {
      console.error('Error cargando países:', err);
      addToast(err.message || 'Error al cargar países', 'error');
      setPaises([]);
    }
  };

  const loadUser = async (id) => {
    try {
      const user = await users.getById(id);
      const userMaxLevel = Math.max(...(user.Roles?.map(r => r.level) || []), 0);
      if (userMaxLevel > userLevel) {
        setError('No tienes permisos para editar este usuario (rol superior)');
        setTimeout(() => onClose(), 2000);
        return;
      }
      setFormData({
        username: user.username,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email,
        password: '',
        isActive: user.isActive,
        roles: user.Roles?.map(r => r.name) || [],
        document_type: user.document_type || '',
        document_number: user.document_number || '',
        calle: user.calle || '',
        numero: user.numero || '',
        entre: user.entre || '',
        avenida: user.avenida || '',
        localidad: user.localidad || '',
        municipio: user.municipio || '',
        provincia: user.provincia || '',
        pais_id: user.id_pais ? String(user.id_pais) : (user.pais?.id ? String(user.pais.id) : ''),
        foto: user.foto || null,
      });
      setExistingPhoto(user.foto);
    } catch (err) {
      setError('Error cargando usuario');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (roleName) => {
    const role = availableRoles.find(r => r.name === roleName);
    if (role && role.level > userLevel) {
      addToast('No puedes asignar un rol con nivel superior al tuyo', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setFormData(prev => ({ ...prev, foto: URL.createObjectURL(file) }));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setFormData(prev => ({ ...prev, foto: existingPhoto || null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const invalidRoles = formData.roles.filter(roleName => {
        const role = availableRoles.find(r => r.name === roleName);
        return role && role.level > userLevel;
      });
      if (invalidRoles.length > 0) {
        setError(`No puedes asignar roles de nivel superior: ${invalidRoles.join(', ')}`);
        setLoading(false);
        return;
      }

      let fotoUrl = existingPhoto;
      if (photoFile) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('foto', photoFile);
        
        // ✅ CORREGIDO: Usar credentials para la cookie, sin Authorization header
        const response = await fetch(`${API_URL}/upload/profile-photo`, {
          method: 'POST',
          credentials: 'include', // 👈 Cookie se envía automáticamente
          body: formDataPhoto
          // No incluir Content-Type, fetch lo pone automáticamente con boundary para FormData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir foto');
        }
        
        const data = await response.json();
        fotoUrl = data.foto;
      }

      const dataToSend = { ...formData, foto: fotoUrl };
      if (isEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (dataToSend.pais_id === '' || dataToSend.pais_id === undefined) {
        dataToSend.pais_id = null;
      } else {
        dataToSend.pais_id = parseInt(dataToSend.pais_id);
      }

      if (isEdit) {
        await users.update(userId, dataToSend);
      } else {
        await users.create(dataToSend);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="user-form" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </>
      }
    >
      {error && <div className="login-error mb-4">{error}</div>}
      
      <form id="user-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <Input label="Nombre de usuario" name="username" value={formData.username} onChange={handleChange} required />
          <Input label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} />
        </div>
        <div className="form-row">
          <Input label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <Input label={isEdit ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"} type="password" name="password" value={formData.password} onChange={handleChange} required={!isEdit} />
          <div className="form-group">
            <label>Foto de perfil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {formData.foto && (
                <img 
                  src={formData.foto.startsWith('http') ? formData.foto : `http://localhost:3001${formData.foto}`} 
                  alt="Preview" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              )}
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                <Upload size={16} /> Subir foto
              </button>
              {formData.foto && (
                <button type="button" className="btn btn-danger" onClick={handleRemovePhoto}>
                  <Trash2 size={16} /> Eliminar
                </button>
              )}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tipo documento</label>
            <select name="document_type" value={formData.document_type} onChange={handleChange} className="form-input">
              <option value="">Seleccionar</option>
              <option value="CI">CI</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <Input label="Número documento" name="document_number" value={formData.document_number} onChange={handleChange} />
        </div>

        <div className="form-row">
          <Input label="Calle" name="calle" value={formData.calle} onChange={handleChange} />
          <Input label="Número" name="numero" value={formData.numero} onChange={handleChange} />
        </div>
        <div className="form-row">
          <Input label="Entre (calles)" name="entre" value={formData.entre} onChange={handleChange} />
          <Input label="Avenida" name="avenida" value={formData.avenida} onChange={handleChange} />
        </div>
        <div className="form-row">
          <Input label="Localidad" name="localidad" value={formData.localidad} onChange={handleChange} />
          <Input label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} />
        </div>
        <div className="form-row">
          <Input label="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
          <div className="form-group">
            <label>País</label>
            <select name="pais_id" value={formData.pais_id} onChange={handleChange} className="form-input">
              <option value="">Seleccionar país</option>
              {paises.map(pais => (
                <option key={pais.id} value={pais.id}>{pais.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-h)' }}>
            Roles
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflow: 'auto', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px' }}>
            {availableRoles.map(role => (
              <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.roles.includes(role.name)} onChange={() => handleRoleChange(role.name)} />
                <span style={{ fontSize: '14px' }}>{role.name} - {role.description}</span>
              </label>
            ))}
          </div>
          <small style={{ color: 'var(--text)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
            Solo puedes asignar roles de nivel ≤ {userLevel}
          </small>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
          <span>Usuario activo</span>
        </label>
      </form>

      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};

export default UserForm;