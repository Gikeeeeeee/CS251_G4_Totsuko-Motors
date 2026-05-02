import apiClient from './apiClient';

export const authService = {
  // ฟังก์ชันยิง API Login
  login: async (emailOrUsername: string, password: string) => {
    const response = await apiClient.post('/auth/login', { emailOrUsername, password });
    return response.data;
  },

  // ฟังก์ชันยิง API Verify
  verify: async () => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  // ฟังก์ชันยิง API Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};