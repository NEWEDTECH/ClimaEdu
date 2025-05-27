'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Institution } from '../../_core/modules/institution/core/entities/Institution';

type UserRole = 'student' | 'tutor' | 'admin' | null;

type Courses = Array<{
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

// Tipo para representar uma instituição com a role do usuário nela
type InstitutionWithRole = {
  institution: Institution;
  userRole: UserRole;
};

type ProfileState = {
  id: string;
  role: UserRole;
  institution: Institution;
  institutions: Institution[];
  institutionsWithRoles: InstitutionWithRole[];
  courses: Courses;
  setRole: (role: UserRole) => void;
  setId: (id: string) => void;
  setInstitution: (institution: Institution) => void;
  setInstitutions: (institutions: Institution[]) => void;
  setInstitutionsWithRoles: (institutionsWithRoles: InstitutionWithRole[]) => void;
  setCourses: (courses: Courses) => void;
  getUserRoleInInstitution: (institutionId: string) => UserRole;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      id: '',
      role: null,
      institution: {} as Institution,
      institutions: [],
      institutionsWithRoles: [],
      courses: [],
      setRole: (role) => set({ role }),
      setId: (id) => set({ id }),
      setInstitution: (institution) => set({ institution }),
      setInstitutions: (institutions) => set({ institutions }),
      setInstitutionsWithRoles: (institutionsWithRoles) => set({ institutionsWithRoles }),
      setCourses: (courses) => set({ courses }),
      getUserRoleInInstitution: (institutionId: string) => {
        const institutionWithRole = get().institutionsWithRoles.find(
          (item) => item.institution.id === institutionId
        );
        return institutionWithRole?.userRole || null;
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);

// Exportar o tipo para uso em outros componentes
export type { InstitutionWithRole };
