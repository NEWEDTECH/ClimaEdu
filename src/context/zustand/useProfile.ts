'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'student' | 'tutor' | 'admin' | null;

type ProfileState = {
  id: string;
  role: UserRole;
  setRole: (role: UserRole) => void;
  setId: (id: string) => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      id: '',
      role: null,
      setRole: (role) => set({ role }),
      setId: (id) => set({ id }),
    }),
    {
      name: 'profile-storage',
    }
  )
);
