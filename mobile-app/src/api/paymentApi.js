import axios from './axios';

export const getPaymentsApi = () => axios.get('/payments');
export const getPaymentByIdApi = (id) => axios.get(`/payments/${id}`);
export const createPaymentApi = (data) => axios.post('/payments', data);
export const updatePaymentApi = (id, data) => axios.put(`/payments/${id}`, data);
export const deletePaymentApi = (id) => axios.delete(`/payments/${id}`);

export const createStripePaymentIntentApi = (data) => axios.post('/payments/stripe/create-intent', data);
export const confirmStripePaymentApi = (data) => axios.post('/payments/stripe/confirm', data);
export const approveCashPaymentApi = (id) => axios.put(`/payments/${id}/approve-cash`);