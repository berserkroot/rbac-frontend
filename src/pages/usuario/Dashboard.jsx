import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UsuarioDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1>Bienvenido, {user?.username}</h1>
        <p>Este es tu panel de control personal</p>
      </div>

      <div className="card">
        <h3>Información de tu cuenta</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="info-row">
            <span>Usuario</span>
            <span>{user?.username}</span>
          </div>
          <div className="info-row">
            <span>Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="info-row">
            <span>Rol</span>
            <span>{user?.roles?.[0]}</span>
          </div>
        </div>
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <p>Desde aquí puedes acceder a tu perfil para configurar la seguridad de tu cuenta.</p>
          <Link to="/profile" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
            Ir a mi perfil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UsuarioDashboard;