'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { ModuleForm } from '@/components/courses/ModuleForm';

type CourseEditLayoutProps = {
  courseId: string;
  children: React.ReactNode;
}

export function CourseEditLayout({ courseId, children }: CourseEditLayoutProps) {
  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar com ModuleForm */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <ModuleForm courseId={courseId} />
          </div>
          
          {/* Área principal */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
