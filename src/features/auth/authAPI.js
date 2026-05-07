import api from '../../api/axios';

export const loginRequest = (credentials) => api.post('/auth/login', credentials);
export const getMeRequest = () => api.get('/auth/get-me');
export const logoutRequest = () => api.post('/auth/logout-user');
export const createUserRequest = (userData) => api.post('/users/create-user', userData);
export const getUsersRequest = () => api.get('/users');
