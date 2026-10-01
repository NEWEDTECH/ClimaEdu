"use client";

import React from 'react';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  /**
   * Fixa a altura na da tela, para páginas com colunas que rolam por conta própria
   * (ex.: player do curso). Por padrão a página cresce com o conteúdo e só o navegador rola.
   */
  fixedHeight?: boolean;
}

export function DashboardLayout({ children, fixedHeight = false }: DashboardLayoutProps) {
  return (
    <div className={cn('flex flex-col bg-transparent', fixedHeight ? 'h-screen' : 'min-h-screen')}>
      <Navbar />

      <main className={cn('flex-1 bg-transparent', fixedHeight && 'min-h-0 overflow-hidden')}>
        {children}
      </main>
    </div>
  );
}
