import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { credentials, members } from '../data/dummyData';

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
    const cred = credentials.find(
      c => c.id === memberId && c.password === password
    );
    if (!cred) return { success: false, message: 'Wrong ID or password' };

    const memberData = members.find(m => m.id === memberId);
    const userData   = { ...memberData, role: cred.role };

    await AsyncStorage.setItem('shomoy_user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem('shomoy_user');
    setUser(null);
  };

  // Profile update
  const updateUser = async (data) => {
    const updated = { ...user, ...data };
    await AsyncStorage.setItem('shomoy_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
