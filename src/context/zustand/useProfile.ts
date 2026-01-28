'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'STUDENT' | 'TUTOR' | 'LOCAL_ADMIN' | 'SYSTEM_ADMIN' | 'CONTENT_MANAGER' | 'SUPER_ADMIN' | null;

type Courses = Array<{
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

type InfoUser = {
  id: string;
  name: string;
  currentRole: UserRole;
  currentIdInstitution: string;
};

type InstitutionInfo = {
  idInstitution: string;
  nameInstitution: string;
  urlImage: string;
  roleInstitution: UserRole;
  primary_color: string;
  secondary_color: string;
};

type InfoInstitutions = {
  institutions: InstitutionInfo;
};

type ProfileState = {
  infoUser: InfoUser;
  infoInstitutions: InfoInstitutions;
  infoInstitutionsRole: InstitutionInfo[];
  courses: Courses;
  setInfoUser: (infoUser: InfoUser) => void;
  setInfoInstitutions: (infoInstitutions: InfoInstitutions) => void;
  setInfoInstitutionsRole: (infoInstitutionsRole: InstitutionInfo[]) => void;
  setCourses: (courses: Courses) => void;
  getUserRoleInInstitution: (institutionId: string) => UserRole;
  updateCurrentInstitution: (institutionId: string) => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      infoUser: {
        id: '',
        name: '',
        currentRole: null,
        currentIdInstitution: '',
      },
      infoInstitutions: {
        institutions: {
          idInstitution: '',
          nameInstitution: '',
          urlImage: '',
          primary_color: '',
          secondary_color: '',
          roleInstitution: null
        }
      },
      infoInstitutionsRole: [],
      courses: [],
      setInfoUser: (infoUser) => set({ infoUser }),
      setInfoInstitutions: (infoInstitutions) => set({ infoInstitutions }),
      setInfoInstitutionsRole: (infoInstitutionsRole) => set({ infoInstitutionsRole }),
      setCourses: (courses) => set({ courses }),
      getUserRoleInInstitution: (institutionId: string) => {
        const institution = get().infoInstitutions.institutions;
        if (institution.idInstitution === institutionId) {
          return institution.roleInstitution;
        }
        return null;
      },
      updateCurrentInstitution: (institutionId: string) => {
        const institution = get().infoInstitutions.institutions;
        if (institution.idInstitution === institutionId) {
          set({
            infoUser: {
              ...get().infoUser,
              currentIdInstitution: institutionId,
              currentRole: institution.roleInstitution,
            },
          });
        }
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);

export type { InfoUser, InstitutionInfo, InfoInstitutions };
