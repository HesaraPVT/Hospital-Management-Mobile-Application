import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
      console.log('🔐 [AUTH] Attempting login with email:', email);
      const response = await axios.post('/auth/login', { email, password });
      console.log('✅ [AUTH] Login successful, received token');
      const { token, ...user } = response.data;
      setUserToken(token);
      setUserInfo(user);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      console.log('💾 [AUTH] Token and user info saved to AsyncStorage');
    } catch (error) {
      console.error('❌ [AUTH] Login failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('📝 [AUTH] Attempting registration with email:', email);
      const response = await axios.post('/auth/register', { name, email, password });
      console.log('✅ [AUTH] Registration successful, received token');
      const { token, ...user } = response.data;
      setUserToken(token);
      setUserInfo(user);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      console.log('💾 [AUTH] Token and user info saved to AsyncStorage');
    } catch (error) {
      console.error('❌ [AUTH] Registration failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  };

  const isLoggedIn = async () => {
    try {
      console.log('🔍 [AUTH] Checking for existing session...');
      const token = await AsyncStorage.getItem('userToken');
      const user = await AsyncStorage.getItem('userInfo');
      if (token && user) {
        console.log('✅ [AUTH] Found existing session, restoring user:', JSON.parse(user).name);
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      } else {
        console.log('ℹ️  [AUTH] No existing session found');
      }
    } catch (error) {
      console.error('❌ [AUTH] Error checking session:', error.message);
    } finally {
      console.log('✓ [AUTH] Session check complete');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{
      login,
      register,
      logout,
      userToken,
      userInfo,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};