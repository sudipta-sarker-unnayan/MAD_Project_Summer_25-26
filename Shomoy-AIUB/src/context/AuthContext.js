import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { credentials, members } from '../data/dummyData';
import { sendLocalNotification } from '../utils/notify';

const AuthContext = createContext();

const SESSION_DURATION = 30 * 60 * 1000; // ৩০ মিনিট

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const saved  = await AsyncStorage.getItem('shomoy_user');
      const expiry = await AsyncStorage.getItem('shomoy_session_expiry');

      if (saved && expiry && Date.now() < parseInt(expiry)) {
        setUser(JSON.parse(saved));
      } else if (saved) {
        // সেশনের মেয়াদ শেষ হয়ে গেছে
        await AsyncStorage.removeItem('shomoy_user');
        await AsyncStorage.removeItem('shomoy_session_expiry');
      }
    } catch (e) {
      console.log('AsyncStorage load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (memberId, password) => {
    try {
      const cred = credentials.find(
        c => c.id === memberId && c.password === password
      );
      if (!cred) return { success: false, message: 'Wrong ID or password' };

      const memberData = members.find(m => m.id === memberId);
      const userData    = { ...memberData, role: cred.role };

      const expiryTime = Date.now() + SESSION_DURATION;
      await AsyncStorage.setItem('shomoy_user', JSON.stringify(userData));
      await AsyncStorage.setItem('shomoy_session_expiry', expiryTime.toString());
      setUser(userData);
      sendLocalNotification('Welcome back', `${userData.name}`);
      return { success: true };
    } catch (e) {
      console.log('Login error:', e);
      return { success: false, message: 'Something went wrong, please try again.' };
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

  // Profile update
  const updateUser = async (data) => {
    try {
      const updated = { ...user, ...data };
      await AsyncStorage.setItem('shomoy_user', JSON.stringify(updated));
      setUser(updated);
      return { success: true };
    } catch (e) {
      console.log('Update user error:', e);
      return { success: false, message: 'Could not update profile, please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);