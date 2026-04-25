# 🛡️ RBAC System – Frontend

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/Licencia-Internal%20Use-red)](LICENSE)

Frontend del sistema de control de acceso basado en roles.  
Construido con **React**, **Vite**, **CSS Modules** y **React Router**.  
Ofrece una interfaz moderna, responsiva y completamente funcional para:

- Gestión de usuarios, roles y permisos
- Perfil personal (con autenticación y 2FA)
- Notificaciones en tiempo real
- Configuración de la aplicación

---

## 📋 Requisitos previos

- Node.js >= 18
- npm o yarn
- Backend del sistema RBAC (API REST)

---

## 🚀 Tecnologías principales

| Tecnología      | Uso                           |
|----------------|-------------------------------|
| React 18       | UI interactiva                |
| Vite           | Bundler rápido                |
| React Router   | Navegación SPA                |
| Lucide React   | Iconos modernos               |
| Axios          | Cliente HTTP                  |
| React Toastify | Notificaciones emergentes     |
| qrcode.react   | Generación de QR para 2FA     |
| Socket.io      | Comunicación en tiempo real (notificaciones, eventos) |

---


## 📦 Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/rbac-frontend.git
cd rbac-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env
# Edita .env con la URL de tu API

# Iniciar en modo desarrollo
npm run dev

