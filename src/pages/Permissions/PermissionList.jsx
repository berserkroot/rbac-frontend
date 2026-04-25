// src/views/permissions/PermissionList.jsx
import { useState, useEffect } from 'react';
import { permissions } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PermissionForm from './PermissionForm';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';
import { exportToExcel } from '../../utils/export';
import { useToast } from '../../context/ToastContext';

const PermissionList = () => {
  const { addToast } = useToast();
  const [permList, setPermList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPerm, setDeletingPerm] = useState(null);
  const limit = 10;

  const resources = ['users', 'roles', 'permissions', 'dashboard'];
  const actions = ['create', 'read', 'update', 'delete', 'manage'];

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: searchTerm, resource: resourceFilter, action: actionFilter };
      const data = await permissions.getAll(params);
      setPermList(data.data);
      setTotalPages(data.meta.pages);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      addToast(error.message || 'Error al cargar permisos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [page, searchTerm, resourceFilter, actionFilter]);

  const handleDeleteClick = (perm) => {
    setDeletingPerm(perm);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await permissions.delete(deletingPerm.id);
      addToast(`Permiso "${deletingPerm.name}" eliminado correctamente`, 'success');
      if (permList.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadPermissions();
      }
    } catch (error) {
      addToast(error.message || 'Error al eliminar permiso', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeletingPerm(null);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
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
    loadPermissions();
  };

  const handleExport = () => {
    const exportData = permList.map(perm => ({
      ID: perm.id,
      Nombre: perm.name,
      Recurso: perm.resource,
      Acción: perm.action,
      Descripción: perm.description || '',
    }));
    exportToExcel(exportData, 'permisos');
    addToast('Exportación completada', 'success');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setResourceFilter('');
    setActionFilter('');
    setPage(1);
  };

  if (loading && page === 1 && permList.length === 0) return <div className="card">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Permisos</h1>
        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={20} /> Nuevo Permiso
        </button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Buscar por nombre o descripción..."
        onClear={clearFilters}
        onExport={handleExport}
      >
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: '100px' }}
        >
          <option value="">Todos los recursos</option>
          {resources.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: '100px' }}
        >
          <option value="">Todas las acciones</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </FilterBar>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Recurso</th>
              <th>Acción</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No hay permisos</td>
              </tr>
            ) : (
              permList.map((perm) => (
                <tr key={perm.id}>
                  <td>
                    <code style={{ background: 'var(--code-bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      {perm.name}
                    </code>
                  </td>
                  <td>{perm.resource}</td>
                  <td><span className="badge badge-neutral">{perm.action}</span></td>
                  <td>{perm.description}</td>
                  <td>
                    <button onClick={() => handleEdit(perm.id)} className="btn btn-secondary" style={{ padding: '6px', marginRight: '8px' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(perm)} className="btn btn-danger" style={{ padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
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
        <PermissionForm permissionId={editingId} onClose={handleCloseForm} onSave={handleSave} />
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
        <p>¿Estás seguro de que deseas eliminar el permiso <strong>{deletingPerm?.name}</strong>?</p>
        <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default PermissionList;