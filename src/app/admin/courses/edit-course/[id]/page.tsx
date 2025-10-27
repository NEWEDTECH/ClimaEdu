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
import { TutorSelector } from '@/components/courses/TutorSelector';
import { CourseTutorsList, type TutorInfo } from '@/components/courses/CourseTutorsList';
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case';
import { RemoveTutorFromCourseUseCase, RemoveTutorFromCourseInput } from '@/_core/modules/content/core/use-cases/remove-tutor-from-course';
import { ListCourseTutorsUseCase, ListCourseTutorsInput } from '@/_core/modules/content/core/use-cases/list-course-tutors';
import { GetUserByIdUseCase, GetUserByIdInput } from '@/_core/modules/user/core/use-cases/get-user-by-id';
import { ListUsersByRoleUseCase, ListUsersByRoleInput } from '@/_core/modules/user/core/use-cases/list-users-by-role';
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { UserRole, type User } from '@/_core/modules/user/core/entities/User';

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
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<TutorInfo[]>([]);
  const [originalTutors, setOriginalTutors] = useState<TutorInfo[]>([]);
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

        // Fetch tutors
        const listUsersByRoleUseCase = container.get<ListUsersByRoleUseCase>(
          Register.user.useCase.ListUsersByRoleUseCase
        );
        const tutorsResult = await listUsersByRoleUseCase.execute(
          new ListUsersByRoleInput(UserRole.TUTOR)
        );
        setAvailableTutors(tutorsResult.users);

        // Fetch course tutors
        const listCourseTutorsUseCase = container.get<ListCourseTutorsUseCase>(
          Register.content.useCase.ListCourseTutorsUseCase
        );
        const courseTutorsResult = await listCourseTutorsUseCase.execute(
          new ListCourseTutorsInput(courseId)
        );

        const getUserByIdUseCase = container.get<GetUserByIdUseCase>(
          Register.user.useCase.GetUserByIdUseCase
        );

        const tutorPromises = courseTutorsResult.tutors.map(async (association) => {
          const userResult = await getUserByIdUseCase.execute(
            new GetUserByIdInput(association.userId)
          );
          if (userResult.user) {
            return {
              id: userResult.user.id,
              email: userResult.user.email.value,
              name: userResult.user.name,
            } as TutorInfo;
          }
          return null;
        });

        const courseTutorsWithDetails = await Promise.all(tutorPromises);
        const tutors = courseTutorsWithDetails.filter((tutor): tutor is TutorInfo => tutor !== null);

        setSelectedTutors(tutors);
        setOriginalTutors(tutors);

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

  const handleAddTutor = (tutorId: string) => {
    const tutor = availableTutors.find((t) => t.id === tutorId);
    if (tutor && !selectedTutors.some((t) => t.id === tutorId)) {
      setSelectedTutors((prev) => [
        ...prev,
        { id: tutor.id, email: tutor.email.value, name: tutor.name },
      ]);
    }
  };

  const handleRemoveTutor = (tutorId: string) => {
    setSelectedTutors((prev) => prev.filter((t) => t.id !== tutorId));
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

      // Handle tutor changes
      const tutorsToRemove = originalTutors.filter(
        (original) => !selectedTutors.some((selected) => selected.id === original.id)
      );

      const tutorsToAdd = selectedTutors.filter(
        (selected) => !originalTutors.some((original) => original.id === selected.id)
      );

      // Remove tutors
      if (tutorsToRemove.length > 0) {
        const removeTutorUseCase = container.get<RemoveTutorFromCourseUseCase>(
          Register.content.useCase.RemoveTutorFromCourseUseCase
        );

        for (const tutor of tutorsToRemove) {
          try {
            await removeTutorUseCase.execute(
              new RemoveTutorFromCourseInput(tutor.id, courseId)
            );
          } catch (err) {
            console.error(`Error removing tutor ${tutor.email}:`, err);
          }
        }
      }

      // Add tutors
      if (tutorsToAdd.length > 0) {
        const associateTutorUseCase = container.get<AssociateTutorToCourseUseCase>(
          Register.content.useCase.AssociateTutorToCourseUseCase
        );

        for (const tutor of tutorsToAdd) {
          try {
            await associateTutorUseCase.execute({
              userId: tutor.id,
              courseId: courseId,
            });
          } catch (err) {
            console.error(`Error associating tutor ${tutor.email}:`, err);
          }
        }
      }

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
                  <CardFooter className="flex justify-end gap-2">
                    <Link href="/admin/courses">
                      <Button variant="secondary">Cancelar</Button>
                    </Link>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </CardFooter>
                </FormSection>
              </Card>
            </div>

            <div className="space-y-6">
              <TutorSelector
                availableTutors={availableTutors}
                selectedTutorIds={selectedTutors.map((t) => t.id)}
                onAddTutor={handleAddTutor}
              />

              <CourseTutorsList
                tutors={selectedTutors}
                onRemoveTutor={handleRemoveTutor}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
