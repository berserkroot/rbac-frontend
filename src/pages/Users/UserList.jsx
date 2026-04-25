import { useState, useEffect } from 'react';
import { users, roles } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import UserForm from './UserForm';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';
import { exportToExcel } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UserList = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { addToast } = useToast();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const limit = 10;

  const canViewRoles = hasPermission('roles', 'read');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: searchTerm, role: roleFilter };
      const data = await users.getAll(params);
      setUserList(data.data);
      setTotalPages(data.meta.pages);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      addToast(error.message || 'Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!canViewRoles) return;
    try {
      const data = await roles.getAll({ limit: 100 });
      setAvailableRoles(data.data || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      setAvailableRoles([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page, searchTerm, roleFilter]);

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await users.delete(deletingUser.id);
      addToast(`Usuario "${deletingUser.username}" eliminado correctamente`, 'success');
      if (userList.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadUsers();
      }
    } catch (error) {
      addToast(error.message || 'Error al eliminar usuario', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeletingUser(null);
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
    loadUsers();
  };

  const handleExport = () => {
    const exportData = userList.map(user => ({
      ID: user.id,
      Usuario: user.username,
      Nombres: user.nombres || '',
      Apellidos: user.apellidos || '',
      Email: user.email,
      Roles: user.Roles?.map(r => r.name).join(', ') || '',
      Estado: user.isActive ? 'Activo' : 'Inactivo',
      'Último acceso': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : ''
    }));
    exportToExcel(exportData, 'usuarios');
    addToast('Exportación completada', 'success');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setPage(1);
  };

  if (loading && page === 1 && userList.length === 0) return <div className="card">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Usuarios</h1>
        <button onClick={handleNew} className="btn btn-primary">
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Buscar por usuario, nombre, apellido o email..."
        onClear={clearFilters}
        onExport={handleExport}
      >
        {availableRoles.length > 0 && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="">Todos los roles</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        )}
      </FilterBar>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {userList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No hay usuarios</td>
              </tr>
            ) : (
              userList.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.nombres || ''} {user.apellidos || ''}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.Roles?.map(r => (
                      <span key={r.name} className="badge badge-neutral" style={{ marginRight: '4px' }}>
                        {r.name}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(user.id)} className="btn btn-secondary" style={{ padding: '6px', marginRight: '8px' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(user)} className="btn btn-danger" style={{ padding: '6px' }}>
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '12px' }}>
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
        <UserForm userId={editingId} onClose={handleCloseForm} onSave={handleSave} />
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
        <p>¿Estás seguro de que deseas eliminar al usuario <strong>{deletingUser?.username}</strong>?</p>
        <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default UserList;