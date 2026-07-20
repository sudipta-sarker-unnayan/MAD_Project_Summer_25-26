import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { credentials, members } from '../data/dummyData';
import { sendLocalNotification } from '../utils/notify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const saved = await AsyncStorage.getItem('shomoy_user');
      if (saved) setUser(JSON.parse(saved));
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

      await AsyncStorage.setItem('shomoy_user', JSON.stringify(userData));
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
