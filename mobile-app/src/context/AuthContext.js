import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../api/axios';

export const AuthContext = createContext();

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, ...user } = response.data;
      setAuthToken(token);
      setUserToken(token);
      setUserInfo(user);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, phone, birthday) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password, phone, birthday });
      const { token, ...user } = response.data;
      setAuthToken(token);
      setUserToken(token);
      setUserInfo(user);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const updateUserInfo = async (updatedUser) => {
    try {
      setUserInfo(updatedUser);
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Failed to persist updated user info:', error);
    }
  };

  const logout = async () => {
    setAuthToken(null);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  };

  const isLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userInfo');

      if (token) {
        setAuthToken(token);
        setUserToken(token);
        if (storedUser) setUserInfo(JSON.parse(storedUser));

        try {
          const response = await axios.get('/auth/me');
          setUserInfo(response.data);
          await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
        } catch (error) {
          if (error.response?.status === 401) {
            setAuthToken(null);
            setUserToken(null);
            setUserInfo(null);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
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
      updateUserInfo,
      userToken,
      userInfo,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};