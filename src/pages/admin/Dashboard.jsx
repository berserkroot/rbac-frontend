import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { users, roles } from '../../services/api';
import { Users, Shield, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        users.getAll({ limit: 1 }),
        roles.getAll({ limit: 1 })
      ]);

      const usersList = usersData.data || [];
      const rolesList = rolesData.data || [];

      setStats({
        users: usersData.meta?.total || usersList.length,
        roles: rolesData.meta?.total || rolesList.length,
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
    { label: 'Roles', value: stats.roles, icon: Shield, color: 'purple', subtext: 'Sistema jerárquico' },
    { label: 'Mi Rol', value: user?.roles?.[0] || 'N/A', icon: Activity, color: 'orange', subtext: 'Nivel actual' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Bienvenido, {user?.username}</h1>
        <p>Panel de control del sistema de gestión de accesos</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
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
            <Link to="/roles" className="quick-link">
              <Shield size={20} />
              <div>
                <div>Gestionar Roles</div>
                <small>Administrar jerarquías y permisos</small>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3>Información del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="info-row">
              <span>Versión</span>
              <span>v1.0.0</span>
            </div>
            <div className="info-row">
              <span>Entorno</span>
              <span>Producción</span>
            </div>
            <div className="info-row">
              <span>Estado</span>
              <span className="status-online">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;