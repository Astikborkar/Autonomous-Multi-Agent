import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : { id: 'dev-1', email: 'developer@orchestrator.ai', full_name: 'Lead AI Engineer', role: 'developer' },
  isAuthenticated: true,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
