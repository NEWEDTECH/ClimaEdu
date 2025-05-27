'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Chaves para localStorage
const LAST_INSTITUTION_KEY = 'last-institution-id';

// Funções utilitárias para localStorage
const saveLastInstitutionId = (institutionId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_INSTITUTION_KEY, institutionId);
  }
};

const getLastInstitutionId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LAST_INSTITUTION_KEY);
  }
  return null;
};

const removeLastInstitutionId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_INSTITUTION_KEY);
  }
};

type InstitutionStorageState = {
  lastInstitutionId: string | null;
  setLastInstitutionId: (institutionId: string) => void;
  getLastInstitutionId: () => string | null;
  clearLastInstitutionId: () => void;
  initializeFromStorage: () => void;
};

export const useInstitutionStorage = create<InstitutionStorageState>()(
  persist(
    (set, get) => ({
      lastInstitutionId: null,
      
      setLastInstitutionId: (institutionId: string) => {
        saveLastInstitutionId(institutionId);
        set({ lastInstitutionId: institutionId });
      },
      
      getLastInstitutionId: () => {
        const stored = getLastInstitutionId();
        if (stored && stored !== get().lastInstitutionId) {
          set({ lastInstitutionId: stored });
        }
        return stored;
      },
      
      clearLastInstitutionId: () => {
        removeLastInstitutionId();
        set({ lastInstitutionId: null });
      },
      
      initializeFromStorage: () => {
        const stored = getLastInstitutionId();
        if (stored) {
          set({ lastInstitutionId: stored });
        }
      },
    }),
    {
      name: 'institution-storage',
      partialize: (state) => ({ lastInstitutionId: state.lastInstitutionId }),
    }
  )
);


export const institutionStorageUtils = {
  save: saveLastInstitutionId,
  get: getLastInstitutionId,
  remove: removeLastInstitutionId,
};
