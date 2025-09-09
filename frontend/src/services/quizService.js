import api from './api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const quizService = {
  getQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', params);
    return response;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response;
  },

  getQuizStats: async () => {
    const response = await api.get('/quizzes/stats');
    return response;
  },

  getQuizEditability: async (id) => {
    const response = await api.get(`/quizzes/${id}/editability`);
    return response;
  },

  // Student quiz methods
  getStudentQuizzes: async () => {
    const response = await api.get('/quizzes/student/available');
    return response;
  },

  verifyQuizPasscode: async (quizId, passcode) => {
    const response = await api.post(`/quizzes/${quizId}/verify-passcode`, { passcode });
    return response;
  },

  getQuizQuestions: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response;
  },

  submitQuiz: async (quizId, submissionData) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, submissionData);
    return response;
  },

  // Analytics methods
  getAnalytics: async (params = {}) => {
    const response = await api.get('/quizzes/analytics', params);
    return response;
  },

  getQuizResults: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response;
  }
};