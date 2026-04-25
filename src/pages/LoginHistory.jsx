import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginHistory, users } from '../services/api';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const LoginHistory = () => {
  const { user: currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    success: '',
    fromDate: '',
    toDate: '',
  });
  const [usersList, setUsersList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  const isRoot = currentUser?.roles?.includes('root');

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.success !== '' && { success: filters.success }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      };
      const data = await loginHistory.getAll(params);
      setHistory(data.data);
      setTotalPages(data.meta.pages);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!isRoot) return;
    try {
      const data = await users.getAll({ limit: 100 });
      setUsersList(data.data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, filters]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      success: '',
      fromDate: '',
      toDate: '',
    });
    setPage(1);
  };

  const handleRetry = () => {
    loadHistory();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' });
  };

  const getStatusBadge = (success) => {
    if (success) {
      return (
        <span className="badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={14} /> Éxito
        </span>
      );
    } else {
      return (
        <span className="badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <XCircle size={14} /> Fallo
        </span>
      );
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Historial de inicios de sesión</h1>
      <div className="profile-card">
        {/* Barra de filtros */}
        <div className="filters-bar">
          <div className="filter-header" onClick={() => setShowFilters(!showFilters)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Filtros</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </div>
          {showFilters && (
            <div className="filter-fields" style={{ marginTop: '16px' }}>
              <div className="form-row">
                {isRoot && (
                  <div className="form-group">
                    <label>Usuario</label>
                    <select name="userId" value={filters.userId} onChange={handleFilterChange} className="form-input" disabled={loading}>
                      <option value="">Todos</option>
                      {usersList.map(user => (
                        <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Estado</label>
                  <select name="success" value={filters.success} onChange={handleFilterChange} className="form-input" disabled={loading}>
                    <option value="">Todos</option>
                    <option value="true">Éxito</option>
                    <option value="false">Fallo</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Desde</label>
                  <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="form-input" disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Hasta</label>
                  <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="form-input" disabled={loading} />
                </div>
              </div>
              <div className="filter-actions">
                <button className="btn btn-secondary" onClick={clearFilters} disabled={loading}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de resultados o mensaje de error */}
        <div className="table-container">
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
              <button onClick={handleRetry} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} /> Reintentar
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>IP</th>
                  <th>User Agent</th>
                  <th>Fecha/Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5" className="text-center">Cargando...</td>
                  </tr>
                )}
                {!loading && history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">No hay registros</td>
                  </tr>
                )}
                {!loading && history.map(record => (
                  <tr key={record.id}>
                    <td>{record.User ? record.User.username : 'Usuario no registrado'}</td>
                    <td>{record.ip_address}</td>
                    <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{record.user_agent}</td>
                    <td>{formatDate(record.createdAt)}</td>
                    <td>{getStatusBadge(record.success)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {!error && totalPages > 1 && (
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="btn btn-secondary">
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="btn btn-secondary">
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;