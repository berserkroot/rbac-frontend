import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info, AlertTriangle, XCircle, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { markAsRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    fromDate: '',
    toDate: ''
  });

  const fetchNotifications = async (pageNum = 1, filterParams = filters) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...(filterParams.type && { type: filterParams.type }),
        ...(filterParams.fromDate && { fromDate: filterParams.fromDate }),
        ...(filterParams.toDate && { toDate: filterParams.toDate })
      });
      const res = await fetch(`http://localhost:3001/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifications(data.data);
      setTotalPages(data.meta.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchNotifications(1, filters);
  };

  const clearFilters = () => {
    setFilters({ type: '', fromDate: '', toDate: '' });
    fetchNotifications(1, { type: '', fromDate: '', toDate: '' });
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} />;
      case 'error': return <XCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    let date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
    }
    return date.toLocaleString();
  };

  if (loading && notifications.length === 0) return <div className="profile-container"><div className="card">Cargando...</div></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Notificaciones</h1>
      <div className="profile-card">
        {/* Filtros */}
        <div className="filters-bar">
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="form-input">
                <option value="">Todos</option>
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="form-group">
              <label>Desde</label>
              <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="form-input" />
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={applyFilters}>Filtrar</button>
            <button className="btn btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {notifications.length === 0 ? (
          <div className="notif-empty">No hay notificaciones</div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`notif-item-page ${!notif.read ? 'unread' : ''}`}
              >
                <div className="notif-icon-page">{getIcon(notif.type)}</div>
                <div className="notif-content-page">
                  <div className="notif-title-page">{notif.title}</div>
                  <div className="notif-message-page">{notif.message}</div>
                  <div className="notif-time-page">{formatDate(notif.created_at)}</div>
                  {notif.link && (
                    <Link to={notif.link} className="notif-link-page">Ver más</Link>
                  )}
                </div>
                {!notif.read && (
                  <button
                    className="notif-mark-read"
                    onClick={() => handleMarkAsRead(notif.id)}
                    title="Marcar como leída"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => fetchNotifications(page - 1)}
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => fetchNotifications(page + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;