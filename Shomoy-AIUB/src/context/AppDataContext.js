import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as notificationService from '../services/notificationService';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) { setNotifications([]); return; }
    const mine = await notificationService.getNotificationsFor(user.id);
    setNotifications(mine);
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
    <AppDataContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif, refreshNotifications }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);