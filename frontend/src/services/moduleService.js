import api from './api';

export const moduleService = {
  getModules: async (params = {}) => {
    const response = await api.get('/modules', params);
    return response;
  },

  createModule: async (moduleData) => {
    const response = await api.post('/modules', moduleData);
    return response;
  },

  updateModule: async (id, moduleData) => {
    const response = await api.put(`/modules/${id}`, moduleData);
    return response;
  },

  deleteModule: async (id) => {
    const response = await api.delete(`/modules/${id}`);
    return response;
  },

  getModuleStats: async () => {
    const response = await api.get('/modules/stats');
    return response;
  }
};