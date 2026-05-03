import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('📡 [AXIOS] Initializing with BASE_URL:', BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — covers Render free-tier cold-start delay
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Call this on app start to wake up the Render server before the user loads data
export const pingServer = () =>
  instance.get('/health').catch(() => { }); // silently ignore — just warming up

instance.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [AXIOS] Token attached to request:', config.url);
    } else {
      console.log('⚠️  [AXIOS] No token found for request:', config.url);
    }
    console.log(`📤 [AXIOS] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [AXIOS] Request error:', error.message);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log(`📥 [AXIOS] ✅ Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ [AXIOS] Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
    if (error.response?.status === 401) {
      console.warn('🔐 [AXIOS] 401 Unauthorized - Token may be invalid');
    }
    return Promise.reject(error);
  }
);

export default instance;