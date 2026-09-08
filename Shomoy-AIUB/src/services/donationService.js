import AsyncStorage from '@react-native-async-storage/async-storage';
import { donationDrives as seedDrives } from '../data/dummyData';
import { pushNotification } from './notificationService';

const STORAGE_KEY = 'shomoy_donations';
const genId = () => `DD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const loadAll = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // প্রথমবার — dummyData দিয়ে seed
    const seeded = (seedDrives || []).map(d => ({
      donors: [],
      status: 'Active',
      raisedAmount: 0,
      ...d,
    }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (e) {
    console.log('donationService loadAll error:', e);
    return [];
  }
};

const saveAll = async (list) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.log('donationService saveAll error:', e);
    return false;
  }
};

export const getDrives = async () => loadAll();

export const getActiveDrives = async () => {
  const all = await loadAll();
  return all.filter(d => d.status !== 'Completed');
};

export const getCompletedDrives = async () => {
  const all = await loadAll();
  return all.filter(d => d.status === 'Completed');
};

export const getDriveById = async (id) => {
  const all = await loadAll();
  return all.find(d => d.id === id) || null;
};

// user = পুরো লগইন করা user অবজেক্ট (id, name)
export const donate = async (driveId, user, amount) => {
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return { success: false, message: 'সঠিক পরিমাণ লিখুন' };
  }

  const all = await loadAll();
  const drive = all.find(d => d.id === driveId);
  if (!drive) return { success: false, message: 'ড্রাইভ পাওয়া যায়নি' };
  if (drive.status === 'Completed') {
    return { success: false, message: 'এই ড্রাইভ ইতিমধ্যে সম্পন্ন হয়েছে' };
  }

  const donorEntry = {
    userId: user.id,
    name: user.name,
    amount: numAmount,
    date: new Date().toISOString(),
  };

  const newRaised = (drive.raisedAmount || 0) + numAmount;
  const goalReached = newRaised >= drive.goalAmount;

  const updated = all.map(d => {
    if (d.id !== driveId) return d;
    return {
      ...d,
      donors: [donorEntry, ...(d.donors || [])],
      raisedAmount: newRaised,
      status: goalReached ? 'Completed' : d.status,
    };
  });

  await saveAll(updated);

  if (goalReached) {
    await pushNotification({
      recipientId: 'broadcast',
      type: 'event',
      title: 'লক্ষ্য পূরণ হয়েছে 🎉',
      body: `${drive.title} — সংগ্রহের লক্ষ্যমাত্রা সম্পূর্ণ হয়েছে, ধন্যবাদ সবাইকে।`,
      relatedId: driveId,
    });
  }

  return { success: true };
};

// একজন নির্দিষ্ট user-এর সব ডোনেশন হিস্ট্রি
export const getMyDonations = async (userId) => {
  const all = await loadAll();
  const mine = [];
  all.forEach(drive => {
    (drive.donors || []).forEach(donor => {
      if (donor.userId === userId) {
        mine.push({ ...donor, driveTitle: drive.title, driveId: drive.id });
      }
    });
  });
  return mine.sort((a, b) => new Date(b.date) - new Date(a.date));
};