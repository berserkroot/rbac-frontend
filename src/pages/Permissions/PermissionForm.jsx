import { useState, useEffect } from 'react';
import { permissions } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const PermissionForm = ({ permissionId, onClose, onSave }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [existingPermissions, setExistingPermissions] = useState([]);

  const resources = ['users', 'roles', 'permissions', 'dashboard'];
  const actions = ['create', 'read', 'update', 'delete', 'manage'];

  // Cargar lista de permisos existentes para validar duplicados
  const loadExistingPermissions = async () => {
    try {
      const data = await permissions.getAll({ limit: 1000 });
      const perms = data.data || data;
      setExistingPermissions(perms);
    } catch (err) {
      console.error('Error cargando permisos existentes', err);
    }
  };

  useEffect(() => {
    loadExistingPermissions();
    if (permissionId) {
      setIsEdit(true);
      loadPermission(permissionId);
    }
  }, [permissionId]);

  const loadPermission = async (id) => {
    try {
      const data = await permissions.getAll();
      const permsArray = data.data || data;
      const perm = permsArray.find(p => p.id === parseInt(id));
      if (perm) {
        setFormData({
          name: perm.name,
          resource: perm.resource,
          action: perm.action,
          description: perm.description || ''
        });
      } else {
        addToast('Permiso no encontrado', 'error');
        onClose();
      }
    } catch (err) {
      setError('Error cargando permiso');
      addToast('Error al cargar permiso', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Si cambia resource o action, regenerar nombre automáticamente
    if (name === 'resource' || name === 'action') {
      const newResource = name === 'resource' ? value : formData.resource;
      const newAction = name === 'action' ? value : formData.action;
      if (newResource && newAction) {
        setFormData(prev => ({ ...prev, name: `${newResource}:${newAction}` }));
      } else {
        setFormData(prev => ({ ...prev, name: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que resource y action estén seleccionados
    if (!formData.resource || !formData.action) {
      setError('Debes seleccionar un recurso y una acción');
      addToast('Debes seleccionar un recurso y una acción', 'error');
      return;
    }

    // Generar nombre final
    const finalName = `${formData.resource}:${formData.action}`;
    if (!isEdit && existingPermissions.some(p => p.name === finalName)) {
      setError('Ya existe un permiso con este nombre');
      addToast('Ya existe un permiso con este nombre', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await permissions.update(permissionId, { ...formData, name: finalName });
        addToast('Permiso actualizado correctamente', 'success');
      } else {
        await permissions.create({ 
          name: finalName, 
          resource: formData.resource, 
          action: formData.action, 
          description: formData.description 
        });
        addToast('Permiso creado correctamente', 'success');
      }
      onSave();
    } catch (err) {
      const msg = err.message || 'Error al guardar el permiso';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Editar Permiso' : 'Nuevo Permiso'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="perm-form" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </>
      }
    >
      {error && <div className="login-error mb-4">{error}</div>}
      
      <form id="perm-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-h)' }}>
            Recurso
          </label>
          <select
            name="resource"
            value={formData.resource}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--bg)',
              color: 'var(--text-h)'
            }}
            required
          >
            <option value="">Seleccionar...</option>
            {resources.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-h)' }}>
            Acción
          </label>
          <select
            name="action"
            value={formData.action}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--bg)',
              color: 'var(--text-h)'
            }}
            required
          >
            <option value="">Seleccionar...</option>
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <Input
          label="Nombre (auto-generado)"
          name="name"
          value={formData.resource && formData.action ? `${formData.resource}:${formData.action}` : ''}
          disabled
          placeholder="Se generará automáticamente"
        />

        <Input
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          textarea
          placeholder="Describe qué permite este permiso..."
        />
      </form>
    </Modal>
  );
};

export default PermissionForm;