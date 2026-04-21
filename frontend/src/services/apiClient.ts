import axios from 'axios';

const apiClient = axios.create({
  // ชี้ไปที่ Backend ที่รันอยู่ (พอร์ต 3000 ที่เราตั้งไว้)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ดักจับทุก Request เพื่อแนบ Token (ถ้ามีการ Login)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;