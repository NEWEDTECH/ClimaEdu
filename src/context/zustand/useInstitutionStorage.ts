'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const LAST_INSTITUTION_KEY = 'institution-storage';

const saveLastInstitutionId = (institutionId: string): void => {
  localStorage.setItem(LAST_INSTITUTION_KEY, institutionId);
};

const getLastInstitutionId = (): string | null => {
  return localStorage.getItem(LAST_INSTITUTION_KEY);
};

const removeLastInstitutionId = (): void => {
  return;
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
    }
  )
);


export const institutionStorageUtils = {
  save: saveLastInstitutionId,
  get: getLastInstitutionId,
  remove: removeLastInstitutionId,
};
