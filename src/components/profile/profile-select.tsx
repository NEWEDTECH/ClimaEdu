"use client";

import React from 'react';
import { RxAvatar } from "react-icons/rx";
import { FiSettings } from "react-icons/fi";
import { PiCertificate } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import { cn } from "@/lib/utils";

import { Dropdown, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/select'
import { ProfileDropdownOptions } from './index'
import { OptionsProfileProps } from '@/types/profile'
import { ButtonLogout } from '@/components/logout'
import { useProfile } from '@/context/zustand/useProfile';
import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';

export interface ProfileSelectProps {
  avatarUrl?: string;
  className?: string;
  onLogout?: () => void;
}

const OPTIONS_PROFILE: OptionsProfileProps[] = [
  { label: 'Certificados', href: '/student/certificates', icon: <PiCertificate /> },
  { label: 'Conquistas', href: '/student/achievements', icon: <FiAward /> },
  { label: 'Configurações', href: '/student/settings', icon: <FiSettings /> }
];

export function ProfileSelect({ avatarUrl }: ProfileSelectProps) {
  const { infoUser, infoInstitutions, updateCurrentInstitution, getUserRoleInInstitution } = useProfile();
  const { setLastInstitutionId } = useInstitutionStorage();
  const isAdmin = infoUser.currentRole === 'LOCAL_ADMIN' || infoUser.currentRole === 'SYSTEM_ADMIN' || infoUser.currentRole === 'SUPER_ADMIN';

  const handleInstitutionChange = (institutionId: string) => {
    updateCurrentInstitution(institutionId);
    setLastInstitutionId(institutionId);
  };

  // Função para obter o texto da role em português
  const getRoleText = (role: 'STUDENT' | 'TUTOR' | 'LOCAL_ADMIN' | 'SYSTEM_ADMIN' | 'CONTENT_MANAGER' | 'SUPER_ADMIN' | null) => {
    switch (role) {
      case 'LOCAL_ADMIN':
      case 'SYSTEM_ADMIN':
      case 'SUPER_ADMIN':
        return 'Admin';
      case 'TUTOR':
        return 'Tutor';
      case 'CONTENT_MANAGER':
        return 'Gestor de Conteúdo';
      case 'STUDENT':
        return 'Estudante';
      default:
        return '';
    }
  };

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
        {/* Institution selection for admin users */}
        {isAdmin && infoInstitutions.institutions && infoInstitutions.institutions.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold">Instituições</div>
            {infoInstitutions.institutions.map(inst => {
              const userRole = getUserRoleInInstitution(inst.idInstitution);
              return (
                <DropdownMenuItem 
                  key={inst.idInstitution}
                  onClick={() => handleInstitutionChange(inst.idInstitution)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-4 h-4 text-muted-foreground flex items-center justify-center">
                    <MdOutlineSchool />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "block truncate",
                      infoUser.currentIdInstitution === inst.idInstitution && "font-medium"
                    )}>
                      {inst.nameInstitution}
                    </span>
                    {userRole && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getRoleText(userRole)}
                      </span>
                    )}
                  </div>
                  {infoUser.currentIdInstitution === inst.idInstitution && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </DropdownMenuItem>
              );
            })}
            <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" />
          </>
        )}

        {OPTIONS_PROFILE.map(option => (
          <ProfileDropdownOptions
            key={option.href}
            label={option.label}
            href={option.href}
            icon={option.icon}
          />
        ))}
        <DropdownMenuItem asChild>
          <ButtonLogout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </Dropdown>
  );
}
