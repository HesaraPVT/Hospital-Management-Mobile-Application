import axios from './axios';

export const getNotificationsApi = (limit = 20, skip = 0, unreadOnly = false) =>
  axios.get('/notifications', { params: { limit, skip, unreadOnly } });

export const getUnreadCountApi = () => axios.get('/notifications/unread/count');

export const markNotificationAsReadApi = (notificationId) =>
  axios.patch(`/notifications/${notificationId}/read`);

export const markAllAsReadApi = () => axios.patch('/notifications/read/all');

export const deleteNotificationApi = (notificationId) =>
  axios.delete(`/notifications/${notificationId}`);

export const cancelAppointmentApi = (appointmentId, cancellationReason) =>
  axios.post(`/appointments/${appointmentId}/cancel`, { cancellationReason });
