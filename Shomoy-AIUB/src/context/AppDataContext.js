import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as notificationService from '../services/notificationService';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState(null);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setNotifLoading(false);
      setNotifError(null);
      return;
    }
    setNotifError(null);
    setNotifLoading(true);
    try {
      const mine = await notificationService.getNotificationsFor(user.id);
      setNotifications(mine);
    } catch (e) {
      console.log('refreshNotifications error:', e);
      setNotifError('Failed to load notifications. Please try again later.');
    } finally {
      setNotifLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { refreshNotifications(); }, [refreshNotifications]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    await refreshNotifications();
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    await notificationService.markAllRead(user.id);
    await refreshNotifications();
  };

  const deleteNotif = async (id) => {
    await notificationService.deleteNotification(id);
    await refreshNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppDataContext.Provider value={{
      notifications,
      notifLoading,
      notifError,
      unreadCount,
      markRead,
      markAllRead,
      deleteNotif,
      refreshNotifications,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);