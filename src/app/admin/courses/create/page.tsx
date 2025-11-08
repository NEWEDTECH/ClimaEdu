'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loader';
import { Button } from '@/components/button';
import { FormSection } from '@/components/form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { showToast } from '@/components/toast';
import { CourseFormFields, type CourseFormData } from '@/components/courses/CourseFormFields';
import { CreateCourseUseCase } from '@/_core/modules/content/core/use-cases/create-course/create-course.use-case';
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case';

export default function CreateCoursePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    institutionId: '',
    coverImageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch institutions
        const listInstitutionsUseCase = container.get<ListInstitutionsUseCase>(
          Register.institution.useCase.ListInstitutionsUseCase
        );
        const institutionsResult = await listInstitutionsUseCase.execute({});
        const institutionsForDropdown = institutionsResult.institutions.map((inst) => ({
          id: inst.id,
          name: inst.name,
        }));
        setInstitutions(institutionsForDropdown);

        // Set default institution
        if (institutionsForDropdown.length > 0) {
          setFormData((prev) => ({
            ...prev,
            institutionId: institutionsForDropdown[0].id,
          }));
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = 'Falha ao carregar dados. Por favor, tente novamente.';
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFieldChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToastId = showToast.loading('Criando curso...');

    try {
      // Create course
      const createCourseUseCase = container.get<CreateCourseUseCase>(
        Register.content.useCase.CreateCourseUseCase
      );
      await createCourseUseCase.execute({
        institutionId: formData.institutionId,
        title: formData.title,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
      });

      showToast.update(loadingToastId, {
        render: 'Curso criado com sucesso!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/courses');
      }, 1000);
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = `Falha ao criar curso: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`;
      showToast.update(loadingToastId, {
        render: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Criar Novo Curso</h1>
            <Link href="/admin/courses">
              <Button variant="primary">Voltar</Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <Card>
            <FormSection onSubmit={handleSubmit} error={null}>
              <CardHeader>
                <CardTitle>Informações do Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseFormFields
                  formData={formData}
                  institutions={institutions}
                  onFieldChange={handleFieldChange}
                  showInstitutionSelect={true}
                  onImageUpload={(url) => handleFieldChange('coverImageUrl', url)}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/courses">
                  <Button variant="secondary">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Curso'}
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
