import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../services/api';
import { Users, Activity } from 'lucide-react';

const GestorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const usersData = await users.getAll({ limit: 1 });
      const usersList = usersData.data || [];

      setStats({
        users: usersData.meta?.total || usersList.length,
        activeUsers: usersList.filter(u => u.isActive).length
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Usuarios', value: stats.users, icon: Users, color: 'blue', subtext: `${stats.activeUsers} activos` },
    { label: 'Mi Rol', value: user?.roles?.[0] || 'N/A', icon: Activity, color: 'orange', subtext: 'Nivel actual' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Bienvenido, {user?.username}</h1>
        <p>Panel de gestión de usuarios</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{loading ? '...' : stat.value}</h3>
                <p>{stat.label}</p>
                <small>{stat.subtext}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="card">
          <h3>Acceso Rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/users" className="quick-link">
              <Users size={20} />
              <div>
                <div>Gestionar Usuarios</div>
                <small>Crear, editar y administrar usuarios</small>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorDashboard;