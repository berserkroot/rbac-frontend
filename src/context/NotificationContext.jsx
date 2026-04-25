import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../socket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth(); // usar el contexto de autenticación
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3001';

  // Función para obtener el conteo de no leídas desde API (inicial)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  // Función para obtener las 10 notificaciones recientes (inicial)
  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/recent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setRecentNotifications(data);
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Marcar como leída (también actualiza localmente)
  const markAsRead = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      if (res.ok) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setRecentNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  // Configurar Socket.io cuando el usuario está autenticado
  useEffect(() => {
    if (authLoading) return; // esperar a que Auth termine de cargar

    if (user) {
      // Conectar socket
      const socket = connectSocket();
      socket.on('connect', () => {
        console.log('Socket conectado');
      });

      // Escuchar nuevas notificaciones
      socket.on('new_notification', (notification) => {
        console.log('Nueva notificación recibida:', notification);
        // Actualizar contador de no leídas
        setUnreadCount(prev => prev + 1);
        // Agregar notificación al inicio de la lista reciente
        setRecentNotifications(prev => [notification, ...prev].slice(0, 10));
      });

      // Escuchar cuando se marca como leída desde otro dispositivo
      socket.on('notification_read', ({ notificationId, unreadCount: newCount }) => {
        console.log('Notificación marcada como leída:', notificationId);
        setUnreadCount(newCount);
        setRecentNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      });

      // Cargar datos iniciales
      fetchUnreadCount();
      fetchRecentNotifications();
    } else {
      // Usuario deslogueado: desconectar socket
      disconnectSocket();
      setUnreadCount(0);
      setRecentNotifications([]);
    }

    // Limpiar al desmontar o cuando cambie el usuario
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('connect');
        socket.off('new_notification');
        socket.off('notification_read');
      }
    };
  }, [user, authLoading, fetchUnreadCount, fetchRecentNotifications]);

  const value = {
    unreadCount,
    recentNotifications,
    loading,
    fetchRecentNotifications, // se mantiene por si se necesita refrescar manualmente
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};