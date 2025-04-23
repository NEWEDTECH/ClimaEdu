"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { RxAvatar } from "react-icons/rx";
import { FiSettings } from "react-icons/fi";
import { PiCertificate } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
import { cn } from "@/lib/utils";

import { Dropdown, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/select'
import { ProfileDropdownOptions } from './index'
import { OptionsProfileProps } from '@/types/profile'
import { ButtonLogout } from '@/components/logout'

export interface ProfileSelectProps {
  avatarUrl?: string;
  className?: string;
  onLogout?: () => void;
}

const OPTIONS_PROFILE: OptionsProfileProps[] = [
  { label: 'Certificados', href: '/student/certificates', icon: <PiCertificate /> },
  { label: 'Conquistas', href: '/student/achievements', icon: <FiAward /> },
  { label: 'Configurações', href: '/settings', icon: <FiSettings /> }
];

export function ProfileSelect({
  avatarUrl,
}: ProfileSelectProps) {
  const router = useRouter();
  
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
      <span className="font-medium text-sm">João da Silva</span>

      <DropdownMenuContent align="end" className="w-56">
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
