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
import { ContentManagerSelector } from '@/components/courses/ContentManagerSelector';
import { ContentManagersList, type ContentManagerInfo } from '@/components/courses/ContentManagersList';
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case';
import { RemoveTutorFromCourseUseCase, RemoveTutorFromCourseInput } from '@/_core/modules/content/core/use-cases/remove-tutor-from-course';
import { DeleteCourseUseCase, DeleteCourseInput } from '@/_core/modules/content/core/use-cases/delete-course';
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
  const [availableContentManagers, setAvailableContentManagers] = useState<User[]>([]);
  const [selectedContentManagers, setSelectedContentManagers] = useState<ContentManagerInfo[]>([]);
  const [originalContentManagers, setOriginalContentManagers] = useState<ContentManagerInfo[]>([]);
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

        // Fetch tutors
        const listUsersByRoleUseCase = container.get<ListUsersByRoleUseCase>(
          Register.user.useCase.ListUsersByRoleUseCase
        );
        const tutorsResult = await listUsersByRoleUseCase.execute(
          new ListUsersByRoleInput(UserRole.TUTOR)
        );
        setAvailableTutors(tutorsResult.users);

        // Fetch content managers
        const contentManagersResult = await listUsersByRoleUseCase.execute(
          new ListUsersByRoleInput(UserRole.CONTENT_MANAGER)
        );
        setAvailableContentManagers(contentManagersResult.users);

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

        const userPromises = courseTutorsResult.tutors.map(async (association) => {
          const userResult = await getUserByIdUseCase.execute(
            new GetUserByIdInput(association.userId)
          );
          if (userResult.user) {
            return {
              id: userResult.user.id,
              email: userResult.user.email.value,
              name: userResult.user.name,
              role: userResult.user.role,
            };
          }
          return null;
        });

        const usersWithDetails = await Promise.all(userPromises);
        const validUsers = usersWithDetails.filter((user): user is { id: string; email: string; name: string; role: UserRole } => user !== null);

        // Separate tutors and content managers by role
        const tutors = validUsers
          .filter((user) => user.role === UserRole.TUTOR)
          .map(({ id, email, name }) => ({ id, email, name } as TutorInfo));
        
        const managers = validUsers
          .filter((user) => user.role === UserRole.CONTENT_MANAGER)
          .map(({ id, email, name }) => ({ id, email, name } as ContentManagerInfo));

        setSelectedTutors(tutors);
        setOriginalTutors(tutors);
        setSelectedContentManagers(managers);
        setOriginalContentManagers(managers);

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
    if (tutor) {
      // Check if already added to avoid duplicates in the current course
      if (!selectedTutors.some((t) => t.id === tutorId)) {
        setSelectedTutors((prev) => [
          ...prev,
          { id: tutor.id, email: tutor.email.value, name: tutor.name },
        ]);
      }
    }
  };

  const handleRemoveTutor = (tutorId: string) => {
    setSelectedTutors((prev) => prev.filter((t) => t.id !== tutorId));
  };

  const handleAddContentManager = (managerId: string) => {
    const manager = availableContentManagers.find((m) => m.id === managerId);
    if (manager) {
      // Check if already added to avoid duplicates in the current course
      if (!selectedContentManagers.some((m) => m.id === managerId)) {
        setSelectedContentManagers((prev) => [
          ...prev,
          { id: manager.id, email: manager.email.value, name: manager.name },
        ]);
      }
    }
  };

  const handleRemoveContentManager = (managerId: string) => {
    setSelectedContentManagers((prev) => prev.filter((m) => m.id !== managerId));
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

      // Handle content manager changes
      const managersToRemove = originalContentManagers.filter(
        (original) => !selectedContentManagers.some((selected) => selected.id === original.id)
      );

      const managersToAdd = selectedContentManagers.filter(
        (selected) => !originalContentManagers.some((original) => original.id === selected.id)
      );

      // Remove content managers
      if (managersToRemove.length > 0) {
        const removeTutorUseCase = container.get<RemoveTutorFromCourseUseCase>(
          Register.content.useCase.RemoveTutorFromCourseUseCase
        );

        for (const manager of managersToRemove) {
          try {
            await removeTutorUseCase.execute(
              new RemoveTutorFromCourseInput(manager.id, courseId)
            );
          } catch (err) {
            console.error(`Error removing content manager ${manager.email}:`, err);
          }
        }
      }

      // Add content managers
      if (managersToAdd.length > 0) {
        const associateTutorUseCase = container.get<AssociateTutorToCourseUseCase>(
          Register.content.useCase.AssociateTutorToCourseUseCase
        );

        for (const manager of managersToAdd) {
          try {
            await associateTutorUseCase.execute({
              userId: manager.id,
              courseId: courseId,
            });
          } catch (err) {
            console.error(`Error associating content manager ${manager.email}:`, err);
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
                  availableTutors={availableTutors}
                  selectedTutors={selectedTutors}
                  onAddTutor={handleAddTutor}
                  onRemoveTutor={handleRemoveTutor}
                  availableContentManagers={availableContentManagers}
                  selectedContentManagers={selectedContentManagers}
                  onAddContentManager={handleAddContentManager}
                  onRemoveContentManager={handleRemoveContentManager}
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
