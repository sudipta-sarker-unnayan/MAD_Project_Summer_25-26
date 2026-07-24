import AsyncStorage from '@react-native-async-storage/async-storage';
import { events as seedEvents } from '../data/dummyData';
import { pushNotification } from './notificationService';

const STORAGE_KEY = 'shomoy_events';
const genId = () => `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const loadAll = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // প্রথমবার — dummyData দিয়ে seed, নতুন ফিল্ডগুলো ডিফল্ট ভ্যালু দিয়ে যোগ
    const seeded = seedEvents.map(e => ({
      description: '',
      time: '',
      applyDeadline: null,
      announcement: '',
      applicants: [],
      selectionPublished: false,
      ...e,
    }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (e) {
    console.log('eventService loadAll error:', e);
    return [];
  }
};

const saveAll = async (list) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.log('eventService saveAll error:', e);
    return false;
  }
};

export const getEvents = async () => loadAll();

// সম্পন্ন (trackerStep 3) ইভেন্টগুলো ডিলিট করা হয় না, শুধু আলাদা করে দেখানো হয় —
// club-এর কাজের ইতিহাস/পোর্টফোলিও হিসেবে থেকে যায়
export const getActiveEvents = async () => {
  const all = await loadAll();
  return all.filter(e => e.trackerStep < 3);
};

export const getCompletedEvents = async () => {
  const all = await loadAll();
  return all.filter(e => e.trackerStep === 3);
};

export const getEventById = async (id) => {
  const all = await loadAll();
  return all.find(e => e.id === id) || null;
};

export const createEvent = async ({ title, description, date, time, location, applyDeadline }) => {
  const all = await loadAll();
  const newEvent = {
    id: genId(),
    title, description, date, time, location, applyDeadline,
    trackerStep: 0,
    committeeOpen: false,
    announcement: '',
    applicants: [],
    selectionPublished: false,
  };
  await saveAll([newEvent, ...all]);
  return newEvent;
};

export const publishEvent = async (id) => {
  const all = await loadAll();
  const event = all.find(e => e.id === id);
  if (!event) return { success: false, message: 'ইভেন্ট পাওয়া যায়নি' };
  const updated = all.map(e => (e.id === id ? { ...e, committeeOpen: true } : e));
  await saveAll(updated);
  await pushNotification({
    recipientId: 'broadcast',
    type: 'event',
    title: 'নতুন ইভেন্ট প্রকাশিত হয়েছে',
    body: `${event.title} — আবেদনের শেষ সময়: ${event.applyDeadline || 'শীঘ্রই জানানো হবে'}`,
    relatedId: id,
  });
  return { success: true };
};

export const updateDeadline = async (id, newDeadline) => {
  const all = await loadAll();
  const updated = all.map(e => (e.id === id ? { ...e, applyDeadline: newDeadline, committeeOpen: true } : e));
  await saveAll(updated);
  return { success: true };
};

export const closeEvent = async (id) => {
  const all = await loadAll();
  const updated = all.map(e => (e.id === id ? { ...e, committeeOpen: false } : e));
  await saveAll(updated);
  return { success: true };
};

// user = পুরো লগইন করা user অবজেক্ট (id, name, role, status)
export const applyToEvent = async (eventId, user) => {
  const all = await loadAll();
  const event = all.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'ইভেন্ট পাওয়া যায়নি' };
  if (!event.committeeOpen) return { success: false, message: 'আবেদনের সময় এখন বন্ধ আছে' };
  if (!(user.role === 'Member' && user.status === 'Active')) {
    return { success: false, message: 'শুধুমাত্র Active Member আবেদন করতে পারবেন' };
  }
  if (event.applicants.some(a => a.userId === user.id)) {
    return { success: false, message: 'আপনি আগেই আবেদন করেছেন' };
  }
  const applicant = { userId: user.id, name: user.name, appliedAt: new Date().toISOString(), status: 'pending' };
  const updated = all.map(e => (e.id === eventId ? { ...e, applicants: [...e.applicants, applicant] } : e));
  await saveAll(updated);
  return { success: true };
};

export const getApplicants = async (eventId) => {
  const event = await getEventById(eventId);
  return event ? event.applicants : [];
};

// selectedUserIds = যাদের নির্বাচন করা হচ্ছে তাদের userId array
export const selectApplicants = async (eventId, selectedUserIds) => {
  const all = await loadAll();
  const updated = all.map(e => {
    if (e.id !== eventId) return e;
    const applicants = e.applicants.map(a => ({
      ...a,
      status: selectedUserIds.includes(a.userId) ? 'selected' : 'not-selected',
    }));
    return { ...e, applicants };
  });
  await saveAll(updated);
  return { success: true };
};

export const publishSelection = async (eventId) => {
  const all = await loadAll();
  const event = all.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'ইভেন্ট পাওয়া যায়নি' };
  const updated = all.map(e => (e.id === eventId ? { ...e, selectionPublished: true } : e));
  await saveAll(updated);

  const selected = event.applicants.filter(a => a.status === 'selected');
  for (const a of selected) {
    await pushNotification({
      recipientId: a.userId,
      type: 'selected',
      title: 'আপনি নির্বাচিত হয়েছেন 🎉',
      body: `${event.title} ইভেন্টের কমিটির জন্য আপনাকে নির্বাচন করা হয়েছে।`,
      relatedId: eventId,
    });
  }
  return { success: true };
};

export const updateTrackerStep = async (eventId, step) => {
  const all = await loadAll();
  const updated = all.map(e => (e.id === eventId ? { ...e, trackerStep: step } : e));
  await saveAll(updated);
  return { success: true };
};

export const updateAnnouncement = async (eventId, text) => {
  const all = await loadAll();
  const previous = all.find(e => e.id === eventId);
  const updated = all.map(e => (e.id === eventId ? { ...e, announcement: text } : e));
  await saveAll(updated);

  // নতুন/পরিবর্তিত ঘোষণা থাকলেই শুধু নোটিফিকেশন পাঠানো হবে
  if (text && text.trim() && text.trim() !== (previous?.announcement || '').trim()) {
    await pushNotification({
      recipientId: 'broadcast',
      type: 'event',
      title: `${previous?.title || 'ইভেন্ট'} — নতুন ঘোষণা`,
      body: text.trim(),
      relatedId: eventId,
    });
  }
  return { success: true };
};