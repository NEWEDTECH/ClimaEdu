'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'student' | 'tutor' | 'admin' |null;

interface ProfileState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
    }),
    {
      name: 'profile-storage',
    }
  )
);
