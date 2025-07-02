"use client";

import React from 'react';
import { RxAvatar } from "react-icons/rx";
import { FiSettings } from "react-icons/fi";
import { PiCertificate } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
//import { MdOutlineSchool } from "react-icons/md";
import { cn } from "@/lib/utils";

import { Dropdown, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/select'
import { ProfileDropdownOptions } from './index'
import { OptionsProfileProps } from '@/types/profile'
import { ButtonLogout } from '@/components/logout'
import { useProfile } from '@/context/zustand/useProfile';
//import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';

export interface ProfileSelectProps {
  avatarUrl?: string;
  className?: string;
  onLogout?: () => void;
}

type DropdownItem = {
  label: string;
  href: string;
};

type UserRole = 'STUDENT' | 'TUTOR' | 'CONTENT_MANAGER' | 'LOCAL_ADMIN' | 'SYSTEM_ADMIN' | 'SUPER_ADMIN';

type DropdownSection = {
  title: string;
  items: DropdownItem[];
  role: UserRole | UserRole[];
};

const studentItems: DropdownItem[] = [
  { label: 'Conteúdos', href: '/student/contents' },
  { label: 'Social', href: '/social' },
  { label: 'Atividades', href: '/student/activities' },
  { label: 'Discussões', href: '/student/forum' },
  { label: 'Questionários', href: '/student/questionnaire' },
  { label: 'Configurações', href: '/student/settings' }
];

const teacherItems: DropdownItem[] = [
  { label: 'Social', href: '/social' },
  { label: 'Acompanhamento', href: '/tutor/follow-up' },
  { label: 'Relatórios', href: '/tutor/reports' },
  { label: 'Cursos', href: '/tutor/courses' },
  { label: 'Gestão de Conteúdos', href: '/tutor/video-upload' },
];

const adminItems: DropdownItem[] = [
  { label: 'Instituições', href: '/admin/institution' },
  { label: 'Social', href: '/social' },
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Podcast', href: '/admin/podcast' },
  { label: 'Alunos', href: '/admin/student' },
  { label: 'Classes', href: '/admin/turmas' },
  { label: 'Professores', href: '/admin/tutor' },
  { label: 'Trilhas', href: '/admin/trails' },
  { label: 'Cursos', href: '/admin/courses' },
  { label: 'Relatórios', href: '/admin/reports' },
  { label: 'Criar Usuário', href: '/admin/create-user' },
  { label: 'Configurações', href: '/admin/settings' },
];

const sections: DropdownSection[] = [
  { title: 'Área do Aluno', items: studentItems, role: 'STUDENT' },
  { title: 'Área do Tutor', items: teacherItems, role: ['TUTOR', 'CONTENT_MANAGER'] },
  { title: 'Área do Admin', items: adminItems, role: ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] }
];

const OPTIONS_PROFILE: OptionsProfileProps[] = [
  { label: 'Certificados', href: '/student/certificates', icon: <PiCertificate /> },
  { label: 'Conquistas', href: '/student/achievements', icon: <FiAward /> },
  { label: 'Configurações', href: '/student/settings', icon: <FiSettings /> }
];

export function ProfileSelect({ avatarUrl }: ProfileSelectProps) {
  const { infoUser } = useProfile();
  //const { infoUser, updateCurrentInstitution } = useProfile();
  //const { setLastInstitutionId } = useInstitutionStorage();
  //const isAdmin = infoUser.currentRole === 'LOCAL_ADMIN' || infoUser.currentRole === 'SYSTEM_ADMIN' || infoUser.currentRole === 'SUPER_ADMIN';

  //const handleInstitutionChange = (institutionId: string) => {
  //  updateCurrentInstitution(institutionId);
  //  setLastInstitutionId(institutionId);
  //};

  // Helper function to check if user has access to a section
  const hasAccessToSection = (sectionRole: UserRole | UserRole[]) => {
    if (Array.isArray(sectionRole)) {
      return sectionRole.includes(infoUser.currentRole!);
    }
    return infoUser.currentRole === sectionRole;
  };

  // Função para obter o texto da role em português
  //const getRoleText = (role: 'STUDENT' | 'TUTOR' | 'LOCAL_ADMIN' | 'SYSTEM_ADMIN' | 'CONTENT_MANAGER' | 'SUPER_ADMIN' | null) => {
  //  switch (role) {
  //    case 'LOCAL_ADMIN':
  //    case 'SYSTEM_ADMIN':
  //    case 'SUPER_ADMIN':
  //      return 'Admin';
  //    case 'TUTOR':
  //      return 'Tutor';
  //    case 'CONTENT_MANAGER':
  //      return 'Gestor de Conteúdo';
  //    case 'STUDENT':
  //      return 'Estudante';
  //    default:
  //      return '';
  //  }
  //};

  // Get current institution name
  //const getCurrentInstitutionName = () => {
  //  const currentInstitution = infoInstitutions.institutions.find(
  //    inst => inst.idInstitution === infoUser.currentIdInstitution
  //  );
  //  return currentInstitution?.nameInstitution || 'dwdwd';
  //};

  return (
    <Dropdown className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
    )}>

      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={'userName'}
            className="w-full h-full object-cover"
          />
        ) : (
          <RxAvatar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </div>
      <span className="font-medium text-sm">
        {infoUser.name}
      </span>

      <DropdownMenuContent align="end" className="w-56">
        {/* Navigation sections based on user role */}
        {sections.map((section) => {
          if (hasAccessToSection(section.role)) {
            return (
              <div key={section.title}>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <ProfileDropdownOptions
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    icon={null}
                  />
                ))}
                <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" />
              </div>
            );
          }
          return null;
        })}

        {/* Profile specific options */}
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Perfil
        </div>
        {OPTIONS_PROFILE.map(option => (
          <ProfileDropdownOptions
            key={option.href}
            label={option.label}
            href={option.href}
            icon={option.icon}
          />
        ))}
        
        <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem asChild>
          <ButtonLogout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </Dropdown>
  );
}
