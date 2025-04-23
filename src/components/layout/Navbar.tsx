"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileSelect } from '@/components/profile';
import { Button } from '@/components/ui/button/button';
import { IoMdMenu } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Dropdown, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/select'
import { cn } from '@/lib/utils';
import { useProfile } from '@/context/zustand/useProfile';

type DropdownItem = {
  label: string;
  href: string;
};

type DropdownSection = {
  title: string;
  items: DropdownItem[];
  role: string;
};

const studentItems: DropdownItem[] = [
  { label: 'Conteúdos', href: '/student/contents' },
  { label: 'Atividades', href: '/student/activities' },
  { label: 'Discussões', href: '/student/forum' },
  { label: 'Questionários', href: '/student/questionnaire' }
];

const teacherItems: DropdownItem[] = [
  { label: 'Acompanhamento', href: '/tutor/follow-up' },
  { label: 'Relatórios', href: '/tutor/reports' },
  { label: 'Gestão de Conteúdos', href: '/tutor/video-upload' },
];

const adminItems: DropdownItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Usuários', href: '/admin/usuarios' },
  { label: 'Cursos', href: '/admin/cursos' },
  { label: 'Relatórios', href: '/admin/relatorios' },
  { label: 'Configurações', href: '/admin/configuracoes' },
];

const sections: DropdownSection[] = [
  { title: 'Área do Aluno', items: studentItems, role: 'student' },
  { title: 'Área do Tutor', items: teacherItems, role: 'tutor' },
  { title: 'Área do Admin', items: adminItems, role: 'admin' }
];

type NavbarProps = {
  userName?: string;
}


export function Navbar({ userName = 'Usuário' }: NavbarProps) {

  const { role } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-950 shadow-sm">

      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold">
          EAD Platform
        </Link>
      </div>

      <div className='flex items-center justify-end'>

        <div className="hidden md:flex items-center space-x-4">
          {sections.map((section) => {
            if (section.role === role) {
              return (
                <Dropdown key={section.title}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  )
                  }>
                  <span>{section.title}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <DropdownMenuContent>
                    {section.items.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link href={item.href}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </Dropdown>
              )
            }
          }
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ProfileSelect
            onLogout={() => console.log('Logout clicked')}
          />
        </div>

      </div>

      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IoCloseSharp size={30} />
          ) : (
            <IoMdMenu size={30} />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="px-4 py-2">
            <div className="flex items-center gap-4">
              <ProfileSelect
                onLogout={() => console.log('Logout clicked')}
              />
            </div>

            {sections.map((section) => (
              <div key={section.title} className="py-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
