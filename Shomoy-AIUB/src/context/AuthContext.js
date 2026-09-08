import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocalNotification } from '../utils/notify';
import api from '../services/api';

const AuthContext = createContext();

const SESSION_DURATION = 30 * 60 * 1000; // ৩০ মিনিট

const mapUser = (u) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  status: u.status,
  department: u.department,
  batch: u.batch,
  bloodGroup: u.blood_group,
  phone: u.phone,
  email: u.email,
  joinDate: u.join_date,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const saved = await AsyncStorage.getItem('shomoy_user');
      const expiry = await AsyncStorage.getItem('shomoy_session_expiry');

      if (saved && expiry && Date.now() < parseInt(expiry)) {
        setUser(JSON.parse(saved));
      } else if (saved) {
        await AsyncStorage.removeItem('shomoy_user');
        await AsyncStorage.removeItem('shomoy_session_expiry');
      }
    } catch (e) {
      console.log('Session load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Login — এখন সার্ভারে POST /auth/login কল করে
  const login = async (memberId, password) => {
    try {
      const { data } = await api.post('/auth/login', { memberId, password });
      if (!data.success) return { success: false, message: data.message || 'Wrong ID or password' };

      const userData = mapUser(data.user);
      const expiryTime = Date.now() + SESSION_DURATION;
      await AsyncStorage.setItem('shomoy_user', JSON.stringify(userData));
      await AsyncStorage.setItem('shomoy_session_expiry', expiryTime.toString());
      setUser(userData);
      sendLocalNotification('Welcome back', `${userData.name}`);
      return { success: true };
    } catch (e) {
      console.log('Login error:', e);
      const message = e.response?.data?.message || 'সার্ভারে সংযোগ করা যায়নি, ইন্টারনেট/সার্ভার চেক করুন';
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('shomoy_user');
      await AsyncStorage.removeItem('shomoy_session_expiry');
      setUser(null);
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  // Profile update — এখন সার্ভারে PATCH /users/:id কল করে
  const updateUser = async (data) => {
    try {
      const res = await api.patch(`/users/${user.id}`, data);
      const updated = mapUser(res.data.user);
      await AsyncStorage.setItem('shomoy_user', JSON.stringify(updated));
      setUser(updated);
      return { success: true };
    } catch (e) {
      console.log('Update user error:', e);
      return { success: false, message: e.response?.data?.message || 'Could not update profile, please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);