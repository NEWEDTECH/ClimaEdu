'use client';

import { SupportMaterialUploadForm } from '@/components/courses/admin';
import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface PageProps {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
    institutionId: string;
  }>;
}

export default function SupportMaterialUploadPage({ params }: PageProps) {
  const { id: courseId, moduleId, lessonId, institutionId } = use(params);

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="min-h-screen bg-background">
          {/* Navegação Voltar */}
          <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Link 
                href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}
                className="inline-flex"
              >
                <Button variant="ghost" className="gap-2">
                  Voltar para Aula
                </Button>
              </Link>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SupportMaterialUploadForm
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              institutionId={institutionId}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
