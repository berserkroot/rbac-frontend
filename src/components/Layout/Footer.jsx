import { useAppSettings } from '../../context/AppSettingsContext';

const Footer = () => {
  const { settings } = useAppSettings();
  const currentYear = new Date().getFullYear();
  const defaultText = `© ${currentYear} Sistema RBAC. Todos los derechos reservados.`;
  const footerText = settings?.footer_text || defaultText;

  return (
    <footer className="dashboard-footer landing-footer">
      <div className="footer-content">
        {footerText}
      </div>
    </footer>
  );
};

export default Footer;