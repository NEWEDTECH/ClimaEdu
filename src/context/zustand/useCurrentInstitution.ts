'use client';

import { create } from 'zustand';
import { Institution } from '@/_core/modules/institution/core/entities/Institution';

type CurrentInstitutionState = {
  institution: Institution | null;
  setInstitution: (institution: Institution) => void;
  clearInstitution: () => void;
};

export const useCurrentInstitution = create<CurrentInstitutionState>((set) => ({
  institution: null,
  
  setInstitution: (institution: Institution) => {
    set({ institution });
  },
  
  clearInstitution: () => {
    set({ institution: null });
  },
}));
