import { UserData } from '@/types/user'; 


export const setUser = (user: UserData) => { 
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
  }
};

export const getRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role');
  }
  return null;
};


export const getUser = (): UserData | null => { 
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const logoutClient = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};