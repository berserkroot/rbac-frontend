import { useAuth } from '../context/AuthContext';
import RootDashboard from './root/Dashboard';
import AdminDashboard from './admin/Dashboard';
import GestorDashboard from './gestor/Dashboard';
import UsuarioDashboard from './usuario/Dashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.roles?.[0]?.toLowerCase();

  switch (role) {
    case 'root':
      return <RootDashboard />;
    case 'administrador':
      return <AdminDashboard />;
    case 'gestor':
      return <GestorDashboard />;
    default:
      return <UsuarioDashboard />;
  }
};

export default DashboardRouter;