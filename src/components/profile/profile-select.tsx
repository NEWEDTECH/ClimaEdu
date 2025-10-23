"use client";

import React from 'react';
import { RxAvatar } from "react-icons/rx";
import { FiSettings } from "react-icons/fi";
import { PiCertificate } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
import { FiUsers, FiActivity, FiBarChart, FiHome, FiMic, FiUserCheck, FiLayers, FiBookOpen, FiUserPlus } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
//import { MdOutlineSchool } from "react-icons/md";
import { cn } from "@/lib/utils";

import { Dropdown, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/select'
import { ProfileDropdownOptions } from './index'
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
  icon: React.ReactNode;
};

type UserRole = 'STUDENT' | 'TUTOR' | 'CONTENT_MANAGER' | 'LOCAL_ADMIN' | 'SYSTEM_ADMIN' | 'SUPER_ADMIN';

type DropdownSection = {
  title: string;
  items: DropdownItem[];
  role: UserRole | UserRole[];
};

const studentItems: DropdownItem[] = [
  { label: 'Social', href: '/social', icon: <FiUsers /> },
  { label: 'Atividades', href: '/student/activities', icon: <FiActivity /> },
  { label: 'Tutoria', href: '/student/tutoring', icon: <FiUserCheck /> },
  { label: 'Certificados', href: '/student/certificates', icon: <PiCertificate /> },
  { label: 'Conquistas', href: '/student/achievements', icon: <FiAward /> },
  { label: 'Configurações', href: '/student/settings', icon: <FiSettings /> },
];

const teacherItems: DropdownItem[] = [
  { label: 'Social', href: '/social', icon: <FiUsers /> },
  { label: 'Acompanhamento', href: '/tutor/follow-up', icon: <FiUserCheck /> },
  { label: 'Relatórios', href: '/tutor/reports', icon: <FiBarChart /> },
  { label: 'Cursos', href: '/tutor/courses', icon: <FiBookOpen /> },
  { label: 'Tutoria', href: '/tutor/tutoring', icon: <FiUserCheck /> },
];

const adminItems: DropdownItem[] = [
  { label: 'Instituições', href: '/admin/institution', icon: <MdSchool /> },
  { label: 'Conquistas', href: '/admin/achievements', icon: <FiAward /> },
  { label: 'Social', href: '/social', icon: <FiUsers /> },
  { label: 'Podcast', href: '/admin/podcast', icon: <FiMic /> },
  { label: 'Alunos', href: '/admin/student', icon: <FiUsers /> },
  { label: 'Classes', href: '/admin/turmas', icon: <FiLayers /> },
  { label: 'Professores', href: '/admin/tutor', icon: <FiUserCheck /> },
  { label: 'Trilhas', href: '/admin/trails', icon: <FiHome /> },
  { label: 'Cursos', href: '/admin/courses', icon: <FiBookOpen /> },
  { label: 'Criar Usuário', href: '/admin/create-user', icon: <FiUserPlus /> },
  { label: 'Configurações', href: '/admin/settings', icon: <FiSettings /> },
];

const sections: DropdownSection[] = [
  { title: 'Área do Aluno', items: studentItems, role: 'STUDENT' },
  { title: 'Área do Tutor', items: teacherItems, role: ['TUTOR', 'CONTENT_MANAGER'] },
  { title: 'Área do Admin', items: adminItems, role: ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] }
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
      "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700",
    )}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={infoUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <RxAvatar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <span className="font-medium text-sm dark:text-white text-black">
          {infoUser.name}
        </span>
      </div>

      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-56"
        )}
      >
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
                    icon={item.icon}
                  />
                ))}
                <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" />
              </div>
            );
          }
          return null;
        })}
        
        <DropdownMenuItem asChild>
          <ButtonLogout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </Dropdown>
  );
}
