import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifications as seedNotifications } from '../data/dummyData';

const STORAGE_KEY = 'shomoy_notifications';
const genId = () => `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const loadAll = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // প্রথমবার — dummyData দিয়ে seed, সবাইকে broadcast ধরা হচ্ছে
    const seeded = seedNotifications.map(n => ({
      recipientId: 'broadcast',
      type: n.type || 'event',
      body: n.body || '',
      time: n.time || '',
      ...n,
    }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (e) {
    console.log('notificationService loadAll error:', e);
    return [];
  }
};

const saveAll = async (list) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.log('notificationService saveAll error:', e);
    return false;
  }
};

export const getNotificationsFor = async (userId) => {
  const all = await loadAll();
  return all.filter(n => n.recipientId === userId || n.recipientId === 'broadcast');
};

export const getUnreadCount = async (userId) => {
  const mine = await getNotificationsFor(userId);
  return mine.filter(n => !n.read).length;
};

export const markRead = async (id) => {
  const all = await loadAll();
  const updated = all.map(n => (n.id === id ? { ...n, read: true } : n));
  await saveAll(updated);
  return updated;
};

export const markAllRead = async (userId) => {
  const all = await loadAll();
  const updated = all.map(n =>
    (n.recipientId === userId || n.recipientId === 'broadcast') ? { ...n, read: true } : n
  );
  await saveAll(updated);
  return updated;
};

export const deleteNotification = async (id) => {
  const all = await loadAll();
  const updated = all.filter(n => n.id !== id);
  await saveAll(updated);
  return updated;
};

// ব্যাকএন্ড আসলে ভবিষ্যতে এই ফাংশনটাই socket/API পুশ কল করবে
export const pushNotification = async ({ recipientId, type, title, body = '', relatedId = null }) => {
  const all = await loadAll();
  const newNotif = {
    id: genId(),
    recipientId,      // নির্দিষ্ট userId, অথবা 'broadcast'
    type,             // 'event' | 'selected' | 'blood' | 'committee'
    title,
    body,
    relatedId,
    read: false,
    time: new Date().toLocaleString('bn-BD'),
  };
  const updated = [newNotif, ...all];
  await saveAll(updated);
  return newNotif;
};