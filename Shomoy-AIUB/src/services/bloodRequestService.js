import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { bloodRequests as seedRequests, members } from '../data/dummyData';

const STORAGE_KEY = 'shomoy_blood_requests';

// ── Maps backend snake_case fields to the shape our screens expect ──
const mapRequest = (r) => ({
  id: r.id,
  bloodGroup: r.blood_group ?? r.bloodGroup,
  hospital: r.hospital,
  requester: r.requester_name ?? r.requester,
  requesterPhone: r.requester_phone ?? r.requesterPhone ?? null,
  date: r.date,
  urgency: r.urgency,
  status: r.status,
});

// ── Local AsyncStorage fallback ──
// Seeds from dummyData once, then reads/writes from AsyncStorage after that,
// so the screen still works with real (device-local) data if the server is down.
const loadAllLocal = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const seeded = (seedRequests || []).map((r) => {
      const member = members.find((m) => m.name === r.requester);
      return { requesterPhone: member?.phone || null, ...r };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (e) {
    console.log('bloodService loadAllLocal error:', e);
    return [];
  }
};

const saveAllLocal = async (list) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.log('bloodService saveAllLocal error:', e);
    return false;
  }
};

// ── Public reads: try real backend first, fall back to AsyncStorage ──
export const getBloodRequests = async () => {
  try {
    const { data } = await api.get('/blood-requests');
    return data.map(mapRequest);
  } catch (e) {
    console.log('getBloodRequests API unavailable, using local storage:', e.message);
    return loadAllLocal();
  }
};

export const getActiveRequests = async () => {
  const all = await getBloodRequests();
  return all.filter((r) => r.status === 'Active');
};

export const getFulfilledRequests = async () => {
  const all = await getBloodRequests();
  return all.filter((r) => r.status === 'Fulfilled');
};

// user = পুরো লগইন করা user অবজেক্ট (id, name, phone)
export const createBloodRequest = async (user, { bloodGroup, hospital, urgency }) => {
  if (!bloodGroup || !hospital) {
    return { success: false, message: 'bloodGroup ও hospital আবশ্যক' };
  }

  try {
    await api.post('/blood-requests', {
      requesterId: user.id,
      bloodGroup,
      hospital,
      urgency: urgency || 'Normal',
    });
    return { success: true };
  } catch (apiError) {
    console.log('createBloodRequest API unavailable, falling back to local storage:', apiError.message);
  }

  const all = await loadAllLocal();
  const entry = {
    id: `BR-${Date.now()}`,
    bloodGroup,
    hospital,
    requester: user.name,
    requesterPhone: user.phone || null,
    date: new Date().toLocaleDateString('en-GB'),
    urgency: urgency || 'Normal',
    status: 'Active',
  };
  await saveAllLocal([entry, ...all]);
  return { success: true };
};

export const markFulfilled = async (id) => {
  try {
    await api.patch(`/blood-requests/${id}/fulfill`);
    return { success: true };
  } catch (e) {
    console.log('markFulfilled API unavailable, falling back to local storage:', e.message);
  }
  const all = await loadAllLocal();
  const updated = all.map((r) => (r.id === id ? { ...r, status: 'Fulfilled' } : r));
  await saveAllLocal(updated);
  return { success: true };
};