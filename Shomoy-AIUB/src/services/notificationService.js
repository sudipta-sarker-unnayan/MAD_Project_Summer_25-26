import api from './api';

const mapNotif = (n) => ({
  id: n.id,
  recipientId: n.recipient_id,
  type: n.type,
  title: n.title,
  body: n.body,
  relatedId: n.related_id,
  read: n.read,
  time: n.created_at ? new Date(n.created_at).toLocaleString('bn-BD') : '',
});

export const getNotificationsFor = async (userId) => {
  const { data } = await api.get(`/notifications/${userId}`);
  return data.map(mapNotif);
};

export const getUnreadCount = async (userId) => {
  try {
    const { data } = await api.get(`/notifications/${userId}/unread-count`);
    return data.count;
  } catch (e) {
    console.log('getUnreadCount error:', e);
    return 0;
  }
};

export const markRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return true;
  } catch (e) {
    console.log('markRead error:', e);
    return false;
  }
};

export const markAllRead = async (userId) => {
  try {
    await api.patch(`/notifications/${userId}/read-all`);
    return true;
  } catch (e) {
    console.log('markAllRead error:', e);
    return false;
  }
};

export const deleteNotification = async (id) => {
  try {
    await api.delete(`/notifications/${id}`);
    return true;
  } catch (e) {
    console.log('deleteNotification error:', e);
    return false;
  }
};

export const pushNotification = async ({ recipientId, type, title, body = '', relatedId = null }) => {
  try {
    const { data } = await api.post('/notifications', { recipientId, type, title, body, relatedId });
    return data;
  } catch (e) {
    console.log('pushNotification error:', e);
    return null;
  }
};