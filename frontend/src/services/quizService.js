import api from './api';

export const quizService = {
  // Lecturer endpoints
  getQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', params);
    return response;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
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

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response;
  },

  getQuizStats: async () => {
    const response = await api.get('/quizzes/stats');
    return response;
  },

  // Student endpoints
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
  }
};