import axios from './axios';

export const getComplaintsApi = (params) => axios.get('/complaints', { params });
export const getComplaintByIdApi = (id) => axios.get(`/complaints/${id}`);
export const createComplaintApi = (data) => axios.post('/complaints', data);
export const updateComplaintApi = (id, data) => axios.put(`/complaints/${id}`, data);
export const deleteComplaintApi = (id) => axios.delete(`/complaints/${id}`);
export const updateComplaintStatusApi = (id, data) => axios.patch(`/complaints/${id}/status`, data);
export const rateComplaintApi = (id, data) => axios.patch(`/complaints/${id}/rate`, data);