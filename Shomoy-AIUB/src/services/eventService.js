import api from './api';
import { pushNotification } from './notificationService';

const mapApplicant = (a) => ({
  userId: a.user_id,
  name: a.name,
  appliedAt: a.applied_at,
  status: a.status,
});

const mapEvent = (e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  date: e.date,
  time: e.time,
  location: e.location,
  applyDeadline: e.apply_deadline,
  trackerStep: e.tracker_step,
  committeeOpen: e.committee_open,
  announcement: e.announcement,
  selectionPublished: e.selection_published,
  applicants: (e.applicants || []).map(mapApplicant),
});

export const getEvents = async () => {
  const { data } = await api.get('/events');
  return data.map(mapEvent);
}

export const getActiveEvents = async () => {
  const all = await getEvents();
  return all.filter(e => e.trackerStep < 3);
};

export const getCompletedEvents = async () => {
  const all = await getEvents();
  return all.filter(e => e.trackerStep === 3);
};

export const getEventById = async (id) => {
  try {
    const { data } = await api.get(`/events/${id}`);
    return mapEvent(data);
  } catch (e) {
    console.log('getEventById error:', e);
    return null;
  }
};

export const createEvent = async ({ title, description, date, time, location, applyDeadline }) => {
  try {
    const { data } = await api.post('/events', { title, description, date, time, location, applyDeadline });
    return mapEvent(data);
  } catch (e) {
    console.log('createEvent error:', e);
    return null;
  }
};

export const publishEvent = async (id) => {
  try {
    await api.post(`/events/${id}/publish`);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const updateDeadline = async (id, newDeadline) => {
  try {
    await api.patch(`/events/${id}/deadline`, { newDeadline });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const closeEvent = async (id) => {
  try {
    await api.patch(`/events/${id}/close`);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

// user = পুরো লগইন করা user অবজেক্ট (id, name, role, status)
export const applyToEvent = async (eventId, user) => {
  try {
    await api.post(`/events/${eventId}/apply`, {
      userId: user.id, name: user.name, role: user.role, status: user.status,
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const getApplicants = async (eventId) => {
  try {
    const { data } = await api.get(`/events/${eventId}/applicants`);
    return data.map(mapApplicant);
  } catch (e) {
    console.log('getApplicants error:', e);
    return [];
  }
};

// selectedUserIds = যাদের নির্বাচন করা হচ্ছে তাদের userId array
export const selectApplicants = async (eventId, selectedUserIds) => {
  try {
    await api.post(`/events/${eventId}/select`, { selectedUserIds });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const publishSelection = async (eventId) => {
  try {
    await api.post(`/events/${eventId}/publish-selection`);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const updateTrackerStep = async (eventId, step) => {
  try {
    await api.patch(`/events/${eventId}/tracker`, { step });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};

export const updateAnnouncement = async (eventId, text) => {
  try {
    await api.patch(`/events/${eventId}/announcement`, { text });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি' };
  }
};