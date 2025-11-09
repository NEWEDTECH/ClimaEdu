'use client';

import { ScormUploadForm } from '@/components/scorm/ScormUploadForm';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/loader';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';

interface PageProps {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default function ScormUploadPage({ params }: PageProps) {
  const { id: courseId, moduleId, lessonId } = use(params);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseInstitution = async () => {
      try {
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        
        const course = await courseRepository.findById(courseId);
        
        if (!course) {
          setError('Curso não encontrado');
          return;
        }
        
        setInstitutionId(course.institutionId);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Erro ao carregar dados do curso');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseInstitution();
  }, [courseId]);

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  if (error || !institutionId) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error || 'Instituição não encontrada'}</span>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

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
            <ScormUploadForm
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
