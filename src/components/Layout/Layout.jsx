import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppSettings } from '../../context/AppSettingsContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { settings } = useAppSettings();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} isMobileOpen={isMobileOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-wrapper ${!isSidebarOpen ? 'expanded' : ''}`}>
        <Header toggleSidebar={toggleSidebar} toggleMobile={toggleMobile} />
        <main className="dashboard-content">
          <Outlet />
        </main>
        <footer className="dashboard-footer">
          <span>{settings.footer_text}</span>
          <span>v1.0.0</span>
        </footer>
      </div>
      {isMobileOpen && <div className="overlay show" onClick={toggleMobile} />}
    </div>
  );
};

export default Layout;