import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://taxi-transportdange.onrender.com/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) => 
  api.post('/auth/login', { username, password });

export const logout = () => 
  api.post('/auth/logout');

export const getMe = () => 
  api.get('/auth/me');

// Missions
export const getMissions = (filters = {}) => 
  api.get('/missions', { params: filters });

export const getMission = (id) => 
  api.get(`/missions/${id}`);

export const createMission = (data) => 
  api.post('/missions', data);

export const updateMission = (id, data) => 
  api.put(`/missions/${id}`, data);

export const deleteMission = (id) => 
  api.delete(`/missions/${id}`);

export const confirmerMission = (id) => 
  api.post(`/missions/${id}/confirmer`);

export const prendreMission = (id) => 
  api.post(`/missions/${id}/pec`);

export const terminerMission = (id) => 
  api.post(`/missions/${id}/terminer`);

export const ajouterCommentaire = (id, commentaire) => 
  api.post(`/missions/${id}/commentaire`, { commentaire });

// Chauffeurs
export const getChauffeurs = () => 
  api.get('/chauffeurs');

export const getMissionsChauffeur = (chauffeurId, filters = {}) => 
  api.get(`/chauffeurs/${chauffeurId}/missions`, { params: filters });
// Admin - Gestion des utilisateurs
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
};

export default api;
