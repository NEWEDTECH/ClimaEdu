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
  const { institution, institutions, setInstitution, role, getUserRoleInInstitution } = useProfile();
  const { setLastInstitutionId } = useInstitutionStorage();
  const isAdmin = role === 'admin';

  const handleInstitutionChange = (inst: any) => {
    setInstitution(inst);
    setLastInstitutionId(inst.id);
  };

  // Função para obter o texto da role em português
  const getRoleText = (role: 'student' | 'tutor' | 'admin' | null) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'tutor':
        return 'Tutor';
      case 'student':
        return 'Estudante';
      default:
        return '';
    }
  };

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
        {institution?.name ? institution.name : 'João da Silva'}
      </span>

      <DropdownMenuContent align="end" className="w-56">
        {/* Institution selection for admin users */}
        {isAdmin && institutions && institutions.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold">Instituições</div>
            {institutions.map(inst => {
              const userRole = getUserRoleInInstitution(inst.id);
              return (
                <DropdownMenuItem 
                  key={inst.id}
                  onClick={() => handleInstitutionChange(inst)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-4 h-4 text-muted-foreground flex items-center justify-center">
                    <MdOutlineSchool />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "block truncate",
                      institution?.id === inst.id && "font-medium"
                    )}>
                      {inst.name}
                    </span>
                    {userRole && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getRoleText(userRole)}
                      </span>
                    )}
                  </div>
                  {institution?.id === inst.id && (
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
