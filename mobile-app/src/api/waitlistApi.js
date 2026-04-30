import axios from './axios';

export const addToWaitlistApi = (data) => axios.post('/waitlist', data);
export const getUserWaitlistApi = () => axios.get('/waitlist');
export const removeFromWaitlistApi = (waitlistId) => axios.delete(`/waitlist/${waitlistId}`);
