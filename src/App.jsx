import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext'; // 👈 importar
import Toast from './components/common/Toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout/Layout';
import DashboardRouter from './pages/DashboardRouter';
import UserList from './pages/Users/UserList';
import RoleList from './pages/Roles/RoleList';
import PermissionList from './pages/Permissions/PermissionList';
import Profile from './pages/Profile';
import AppConfig from './pages/Config/AppConfig';
import RecoveryUpload from './pages/RecoveryUpload';
import Notifications from './pages/Notifications';
import PasswordPolicy from './pages/Config/PasswordPolicy';
import LoginHistory from './pages/LoginHistory';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

const ConfigRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  const role = user?.roles?.[0]?.toLowerCase();
  return (role === 'root' || role === 'administrador') ? children : <Navigate to="/dashboard" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  const role = user?.roles?.[0]?.toLowerCase();
  return role === 'root' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* 👈 Envolver después de AuthProvider */}
        <AppSettingsProvider>
          <NotificationProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/recovery" element={<RecoveryUpload />} />
                  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="dashboard" element={<DashboardRouter />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="roles" element={<RoleList />} />
                    <Route path="permissions" element={<PermissionList />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="config/app" element={
                      <ConfigRoute>
                        <AppConfig />
                      </ConfigRoute>
                    } />
                    <Route path="config/password-policy" element={
                      <AdminRoute>
                        <PasswordPolicy />
                      </AdminRoute>
                    } />
                    <Route path="config/login-history" element={
                      <ConfigRoute>
                        <LoginHistory />
                      </ConfigRoute>
                    } />
                  </Route>
                </Routes>
              </BrowserRouter>
              <Toast />
            </ToastProvider>
          </NotificationProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;