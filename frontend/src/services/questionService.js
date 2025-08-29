import api from './api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const questionService = {
  getQuestionsByModule: async (moduleId, params = {}) => {
    const response = await api.get(`/questions/module/${moduleId}`, params);
    return response;
  },

  createQuestion: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create question');
    }
    
    return await response.json();
  },

  updateQuestion: async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update question');
    }
    
    return await response.json();
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response;
  },

  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response;
  }
};