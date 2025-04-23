"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileSelect } from '@/components/profile';
import { Button } from '@/components/ui/button/button';
import { IoMdMenu } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
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
  { label: 'Questionários', href: '/student/questionnaire' },
  { label: 'Configurações', href: '/student/settings' }
];

const teacherItems: DropdownItem[] = [
  { label: 'Acompanhamento', href: '/tutor/follow-up' },
  { label: 'Relatórios', href: '/tutor/reports' },
  { label: 'Gestão de Conteúdos', href: '/tutor/video-upload' },
];

const adminItems: DropdownItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Alunos', href: '/admin/student' },
  { label: 'Professores', href: '/admin/tutor' },
  { label: 'Cursos', href: '/admin/courses' },
  { label: 'Relatórios', href: '/admin/reports' },
  { label: 'Configurações', href: '/admin/settings' },
];

const sections: DropdownSection[] = [
  { title: 'Área do Aluno', items: studentItems, role: 'student' },
  { title: 'Área do Tutor', items: teacherItems, role: 'tutor' },
  { title: 'Área do Admin', items: adminItems, role: 'admin' }
];

type NavbarProps = {
  userName?: string;
}


export function Navbar() {

  const { role } = useProfile();
  console.log(role)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
                <div className={cn(
                  "flex w-full items-center gap-4 px-3 py-2 text-sm font-medium rounded-md"
                )}>

                  {section.items.map(item => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className='px-3 py-2 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}

                </div>
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
        <div className="md:hidden absolute top-16 left-0 right-0 h-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="px-4 py-2">
            <div className="flex items-center gap-4">
              <ProfileSelect
                onLogout={() => console.log('Logout clicked')}
              />
            </div>

            {sections.map((section) => {
              if (section.role === role) {
                return (
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
                )
              }
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
