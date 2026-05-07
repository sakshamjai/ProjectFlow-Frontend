import api from '../../api/axios';

export const fetchTasksRequest = () => api.get('/tasks');
export const fetchTasksByProjectRequest = (projectId) => api.get(`/tasks/project/${projectId}`);
export const createTaskRequest = (data) => api.post('/tasks/create', data);
export const updateTaskRequest = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTaskRequest = (id) => api.delete(`/tasks/${id}`);
export const fetchDashboardRequest = () => api.get('/dashboard');
