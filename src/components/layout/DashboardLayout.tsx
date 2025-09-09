"use client";

import React from 'react';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-transparent">
      <Navbar />
      
      <main className="flex-1 bg-transparent">
        {children}
      </main>
    </div>
  );
}
