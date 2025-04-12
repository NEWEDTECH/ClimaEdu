"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">

      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">

        <Navbar userName={'João da silva'} />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
