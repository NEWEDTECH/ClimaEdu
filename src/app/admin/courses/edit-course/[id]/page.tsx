'use client';

import { useState, useEffect, use } from 'react';
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
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
import { DeleteCourseUseCase, DeleteCourseInput } from '@/_core/modules/content/core/use-cases/delete-course';
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = 'then' in params ? use(params) : params;
  const { id: courseId } = resolvedParams;

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

        // Fetch course data
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const course = await courseRepository.findById(courseId);

        if (!course) {
          setError('Curso não encontrado');
          setLoading(false);
          return;
        }

        setFormData({
          title: course.title,
          description: course.description,
          institutionId: course.institutionId,
          coverImageUrl: course.coverImageUrl || '',
        });

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
  }, [courseId]);

  const handleFieldChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const loadingToastId = showToast.loading('Excluindo curso...');

    try {
      const deleteCourseUseCase = container.get<DeleteCourseUseCase>(
        Register.content.useCase.DeleteCourseUseCase
      );

      await deleteCourseUseCase.execute(new DeleteCourseInput(courseId));

      showToast.update(loadingToastId, {
        render: 'Curso excluído com sucesso!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/courses');
      }, 1000);
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = `Falha ao excluir curso: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`;
      showToast.update(loadingToastId, {
        render: errorMessage,
        type: 'error',
      });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToastId = showToast.loading('Atualizando curso...');

    try {
      // Update course
      const updateCourseUseCase = container.get<UpdateCourseUseCase>(
        Register.content.useCase.UpdateCourseUseCase
      );
      await updateCourseUseCase.execute({
        id: courseId,
        title: formData.title,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
      });

      showToast.update(loadingToastId, {
        render: 'Curso atualizado com sucesso!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/courses');
      }, 1000);
    } catch (error) {
      console.error('Error updating course:', error);
      const errorMessage = `Falha ao atualizar curso: ${
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

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href="/admin/courses">
                  <Button>Voltar para Lista de Cursos</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Editar Curso</h1>
            <Link href="/admin/courses">
              <Button variant="primary">Voltar</Button>
            </Link>
          </div>

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
                  showInstitutionSelect={false}
                  onImageUpload={(url) => handleFieldChange('coverImageUrl', url)}
                />
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="secondary"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={isSubmitting || isDeleting}
                >
                  Excluir Curso
                </Button>
                <div className="flex gap-2">
                  <Link href="/admin/courses">
                    <Button variant="secondary" disabled={isSubmitting || isDeleting}>Cancelar</Button>
                  </Link>
                  <Button type="submit" variant="primary" disabled={isSubmitting || isDeleting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardFooter>
            </FormSection>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-red-600">Confirmar Exclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Tem certeza que deseja excluir este curso? Esta ação é irreversível e irá remover:
                  </p>
                  <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Todas as informações do curso</li>
                    <li>Todas as associações com tutores e gestores</li>
                    <li>O curso não poderá ser recuperado</li>
                  </ul>
                  <p className="font-semibold text-red-600">
                    Curso: {formData.title}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
