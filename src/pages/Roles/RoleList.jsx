// src/views/roles/RoleList.jsx
import { useState, useEffect } from 'react';
import { roles } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import RoleForm from './RoleForm';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';
import { exportToExcel } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RoleList = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { addToast } = useToast();
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const limit = 10;

  const canCreate = hasPermission('roles', 'create');
  const canUpdate = hasPermission('roles', 'update');
  const canDelete = hasPermission('roles', 'delete');
  const isRoot = currentUser?.roles?.includes('root');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: searchTerm, level: levelFilter };
      const data = await roles.getAll(params);
      setRoleList(data.data);
      setTotalPages(data.meta.pages);
    } catch (error) {
      console.error('Error cargando roles:', error);
      addToast(error.message || 'Error al cargar roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page, searchTerm, levelFilter]);

  const handleDeleteClick = (role) => {
    const systemRoles = ['root', 'administrador', 'gestor', 'usuario'];
    if (systemRoles.includes(role.name)) {
      addToast('No se pueden eliminar roles del sistema', 'error');
      return;
    }
    if (!isRoot && role.name === 'root') {
      addToast('No tienes permisos para eliminar el rol root', 'error');
      return;
    }
    setDeletingRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await roles.delete(deletingRole.id);
      addToast(`Rol "${deletingRole.name}" eliminado correctamente`, 'success');
      if (roleList.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadRoles();
      }
    } catch (error) {
      addToast(error.message || 'Error al eliminar rol', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeletingRole(null);
    }
  };

  const handleEdit = (role) => {
    if (!isRoot && role.name === 'root') {
      addToast('No tienes permisos para editar el rol root', 'error');
      return;
    }
    setEditingId(role.id);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    handleCloseForm();
    loadRoles();
  };

  const handleExport = () => {
    const exportData = roleList.map(role => ({
      ID: role.id,
      Nombre: role.name,
      Descripción: role.description,
      Nivel: role.level,
      Permisos: role.Permissions?.map(p => p.name).join(', ') || '',
    }));
    exportToExcel(exportData, 'roles');
    addToast('Exportación completada', 'success');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLevelFilter('');
    setPage(1);
  };

  if (loading && page === 1 && roleList.length === 0) return <div className="card">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Roles</h1>
        {canCreate && (
          <button onClick={handleNew} className="btn btn-primary">
            <Plus size={20} /> Nuevo Rol
          </button>
        )}
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Buscar por nombre o descripción..."
        onClear={clearFilters}
        onExport={handleExport}
      >
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: '100px' }}
        >
          <option value="">Todos los niveles</option>
          <option value="1">Nivel 1 (Usuario)</option>
          <option value="2">Nivel 2 (Gestor)</option>
          <option value="3">Nivel 3 (Admin)</option>
          <option value="4">Nivel 4 (Root)</option>
        </select>
      </FilterBar>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Nivel</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roleList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No hay roles</td>
              </tr>
            ) : (
              roleList.map((role) => {
                const isSystemRole = ['root', 'administrador', 'gestor', 'usuario'].includes(role.name);
                const canEditRole = canUpdate && (isRoot || role.name !== 'root');
                const canDeleteRole = canDelete && (isRoot || role.name !== 'root') && !isSystemRole;

                return (
                  <tr key={role.id}>
                    <td>
                      <span className={`badge ${
                        role.name === 'root' ? 'badge-danger' : 
                        role.name === 'administrador' ? 'badge-success' : 
                        'badge-neutral'
                      }`} style={{ marginRight: '8px' }}>
                        {role.name}
                      </span>
                    </td>
                    <td>{role.description}</td>
                    <td>{role.level}</td>
                    <td>{role.Permissions?.length || 0} permisos</td>
                    <td>
                      {canEditRole && (
                        <button 
                          onClick={() => handleEdit(role)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', marginRight: '8px' }}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDeleteRole && (
                        <button 
                          onClick={() => handleDeleteClick(role)} 
                          className="btn btn-danger" 
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {totalPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn btn-secondary">
                      Anterior
                    </button>
                    <span>Página {page} de {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn btn-secondary">
                      Siguiente
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showForm && (
        <RoleForm roleId={editingId} onClose={handleCloseForm} onSave={handleSave} />
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Eliminar
            </button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar el rol <strong>{deletingRole?.name}</strong>?</p>
        <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default RoleList;