import { create } from "zustand";
export interface User {
  studentId?: number;
  adminId?: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  imageUrl?: string;
}

interface MainStore {
  user: User | null;
  loading: boolean;
  token: string;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string) => void;
}

export const useMainStore = create<MainStore>((set) => ({
  loading: true,
  user: null,
  token: "",

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => set({ token }),
}));
