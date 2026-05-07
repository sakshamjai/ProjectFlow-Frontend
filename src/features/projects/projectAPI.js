import api from '../../api/axios';

export const fetchProjectsRequest = () => api.get('/projects');
export const fetchProjectByIdRequest = (id) => api.get(`/projects/${id}`);
export const createProjectRequest = (data) => api.post('/projects/create', data);
export const updateProjectRequest = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProjectRequest = (id) => api.delete(`/projects/${id}`);
