import { useState, useEffect } from 'react';
import { roles, permissions as permsApi } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RoleForm = ({ roleId, onClose, onSave }) => {
  const { hasPermission } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1,
    permissions: []
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const canViewPermissions = hasPermission('permissions', 'read');

  useEffect(() => {
    if (canViewPermissions) {
      loadPermissions();
    } else {
      setAvailablePermissions([]);
    }
    if (roleId) {
      setIsEdit(true);
      loadRole(roleId);
    }
  }, [roleId, canViewPermissions]);

  const loadPermissions = async () => {
    try {
      const data = await permsApi.getAll(); // { data: [], meta: {} }
      const permsArray = data.data || data; // compatibilidad
      setAvailablePermissions(permsArray);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError('No se pudieron cargar los permisos');
      addToast('Error al cargar permisos', 'error');
    }
  };

  const loadRole = async (id) => {
    try {
      const data = await roles.getAll(); // { data: [], meta: {} }
      const rolesArray = data.data || data;
      const role = rolesArray.find(r => r.id === parseInt(id));
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          level: role.level,
          permissions: role.Permissions?.map(p => p.id) || []
        });
      } else {
        addToast('Rol no encontrado', 'error');
      }
    } catch (err) {
      setError('Error cargando rol');
      addToast('Error al cargar rol', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) : value
    }));
  };

  const handlePermissionChange = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let permNames = [];
      if (canViewPermissions && availablePermissions.length) {
        permNames = availablePermissions
          .filter(p => formData.permissions.includes(p.id))
          .map(p => p.name);
      } else {
        // Si no puede ver permisos, se conservan los IDs actuales (solo para edición)
        // En creación, esto no se usa porque formData.permissions estará vacío
        permNames = formData.permissions;
      }

      const dataToSend = {
        ...formData,
        permissions: permNames
      };

      if (isEdit) {
        await roles.update(roleId, dataToSend);
        addToast('Rol actualizado correctamente', 'success');
      } else {
        await roles.create(dataToSend);
        addToast('Rol creado correctamente', 'success');
      }
      onSave();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Editar Rol' : 'Nuevo Rol'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="role-form" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </>
      }
    >
      {error && <div className="login-error mb-4">{error}</div>}
      
      <form id="role-form" onSubmit={handleSubmit}>
        <Input
          label="Nombre del rol"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-h)'
          }}>
            Nivel de jerarquía
          </label>
          <select
            name="level"
            value={formData.level}
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
          >
            <option value={1}>1 - Usuario</option>
            <option value={2}>2 - Gestor</option>
            <option value={3}>3 - Administrador</option>
            <option value={4}>4 - Root</option>
          </select>
        </div>

        {canViewPermissions && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: 'var(--text-h)'
            }}>
              Permisos
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px',
              maxHeight: '200px',
              overflow: 'auto',
              border: '1px solid var(--border)',
              padding: '12px',
              borderRadius: '6px'
            }}>
              {availablePermissions.map(perm => (
                <label key={perm.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.id)}
                    onChange={() => handlePermissionChange(perm.id)}
                  />
                  <span>{perm.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {!canViewPermissions && (
          <div className="alert alert-info" style={{ padding: '8px', marginBottom: '16px', background: 'var(--code-bg)' }}>
            No tienes permisos para ver la lista de permisos. Los permisos existentes se conservarán.
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RoleForm;