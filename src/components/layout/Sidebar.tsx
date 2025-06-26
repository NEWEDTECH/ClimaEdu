"use client";

import React from 'react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/button/dropdown'

type DropdownItem = {
  label: string;
  href: string;
};

type DropdownSection = {
  title: string;
  items: DropdownItem[];
};

const studentItems: DropdownItem[] = [
  { label: 'Conteúdos', href: '/student/contents' },
  { label: 'Atividades', href: '/student/activities' },
  { label: 'Social', href: '/social' },
  { label: 'Discussões', href: '/student/forum' },
  { label: 'Questionários', href: '/student/questionnaire' },
  { label: 'Conquistas', href: '/student/achievements' },
  { label: 'Certificados', href: '/student/certificates' },
  { label: 'Configurações', href: '/student/settings' },
];

const teacherItems: DropdownItem[] = [
  { label: 'Acompanhamento', href: '/tutor/follow-up' },
  { label: 'Relatórios', href: '/tutor/reports' },
  { label: 'Gestão de Conteúdos', href: '/tutor/video-upload' },
  /*{ label: 'Gestão de Atividades', href: '/tutor/atividades' },
  { label: 'Gestão de Discussões', href: '/tutor/discussoes' },
  { label: 'Gestão de Questionários', href: '/tutor/questionarios' },
  { label: 'Banco de Questões', href: '/tutor/banco-questoes' },*/
];

const adminItems: DropdownItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Usuários', href: '/admin/usuarios' },
  { label: 'Cursos', href: '/admin/cursos' },
  { label: 'Relatórios', href: '/admin/relatorios' },
  { label: 'Configurações', href: '/admin/configuracoes' },
];

const sections: DropdownSection[] = [
  { title: 'Área do Aluno', items: studentItems },
  { title: 'Área do Tutor', items: teacherItems },
  { title: 'Área do Admin', items: adminItems },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-800 flex flex-col">
      
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {sections.map((section) => (
            <DropdownMenu key={section.title}>
              <DropdownMenuTrigger className="flex items-center justify-between w-full p-3 text-left rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <span className="font-medium">{section.title}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {section.items.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
