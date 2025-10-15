'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/card';
import { SelectComponent } from '@/components/select';
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { FormSection } from '@/components/form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CreateCourseUseCase } from '@/_core/modules/content/core/use-cases/create-course/create-course.use-case';
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { InstitutionRepository } from '@/_core/modules/institution';
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case';
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { User, UserRole } from '@/_core/modules/user/core/entities/User';
import { showToast } from '@/components/toast';

type FieldOption = {
  value: string;
  label: string;
}

type BaseFieldConfig = {
  label: string;
  required?: boolean;
  placeholder?: string;
}

type TextFieldConfig = BaseFieldConfig & {
  type: 'text';
}

type TextareaFieldConfig = BaseFieldConfig & {
  type: 'textarea';
  rows?: number;
}

type SelectFieldConfig = BaseFieldConfig & {
  type: 'select';
  options: FieldOption[];
}

type FieldConfig = TextFieldConfig | TextareaFieldConfig | SelectFieldConfig;

type FormData = {
  id?: string;
  title: string;
  description: string;
  institutionId: string;
  instructor: string;
  duration: string;
  category: string;
  level: string;
  status?: string;
  coverImageUrl: string;
  enrolledStudents?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();


  const id = params.id as string;
  const isEditMode = !!id;
  const courseId = id || '';

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    institutionId: '',
    instructor: '',
    duration: '',
    category: '',
    level: 'beginner',
    status: 'active',
    coverImageUrl: '',
    enrolledStudents: 0
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tutors, setTutors] = useState<User[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');
  const [selectedTutors, setSelectedTutors] = useState<Array<{ id: string, email: string }>>([]);
  const [originalTutors, setOriginalTutors] = useState<Array<{ id: string, email: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch institutions
        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );

        const institutionsList = await institutionRepository.list();

        const institutionsForDropdown = institutionsList.map(institution => ({
          id: institution.id,
          name: institution.name
        }));

        setInstitutions(institutionsForDropdown);

        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        );

        const tutorUsers = await userRepository.listByType(UserRole.TUTOR);
        console.log(tutorUsers)
        setTutors(tutorUsers);

        if (isEditMode && courseId) {
          // Fetch course data
          const courseRepository = container.get<CourseRepository>(
            Register.content.repository.CourseRepository
          );

          const course = await courseRepository.findById(courseId);

          if (course) {
            setFormData({
              id: course.id,
              title: course.title,
              description: course.description,
              institutionId: course.institutionId,
              instructor: 'Not specified',
              duration: 'Not specified',
              category: 'General',
              level: 'beginner',
              status: 'active',
              coverImageUrl: course.coverImageUrl || '',
              enrolledStudents: 0,
              createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : String(course.createdAt),
              updatedAt: course.updatedAt instanceof Date ? course.updatedAt.toISOString() : String(course.updatedAt)
            });

            // Fetch tutors associated with this course
            const courseTutorRepository = container.get<CourseTutorRepository>(
              Register.content.repository.CourseTutorRepository
            );

            // Get all course-tutor associations for this course
            const courseTutors = await courseTutorRepository.findByCourseId(courseId);

            // For each association, fetch the user details
            const tutorPromises = courseTutors.map(async (courseTutor) => {
              const user = await userRepository.findById(courseTutor.userId);
              if (user && user.role === UserRole.TUTOR) {
                return { id: user.id, email: user.email.value };
              }
              return null;
            });

            const tutors = (await Promise.all(tutorPromises))
              .filter((tutor): tutor is { id: string, email: string } => tutor !== null);

            setSelectedTutors(tutors);
            setOriginalTutors(tutors);
          } else {
            setError('Curso não encontrado');
          }
        } else if (institutionsForDropdown.length > 0) {
          setFormData(prev => ({ ...prev, institutionId: institutionsForDropdown[0].id }));
        }

        setError(null);
      } catch (err) {
        console.error(`Error fetching ${isEditMode ? 'course' : 'institutions'}:`, err);
        const errorMessage = `Falha ao carregar ${isEditMode ? 'curso' : 'instituições'}. Por favor, tente novamente.`;
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, courseId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Show loading toast
    const loadingToastId = showToast.loading(
      isEditMode ? 'Atualizando curso...' : 'Criando curso...'
    );

    try {
      let newCourseId = '';

      if (isEditMode && formData.id) {
        // Update course
        const updateCourseUseCase = container.get<UpdateCourseUseCase>(
          Register.content.useCase.UpdateCourseUseCase
        );

        await updateCourseUseCase.execute({
          id: formData.id,
          title: formData.title,
          description: formData.description,
          coverImageUrl: formData.coverImageUrl
        });

        newCourseId = formData.id;
      } else {
        // Create course
        const createCourseUseCase = container.get<CreateCourseUseCase>(
          Register.content.useCase.CreateCourseUseCase
        );

        const result = await createCourseUseCase.execute({
          institutionId: formData.institutionId,
          title: formData.title,
          description: formData.description,
          coverImageUrl: formData.coverImageUrl
        });

        newCourseId = result.course.id;
      }

      // Handle tutor associations
      if (isEditMode) {
        const courseTutorRepository = container.get<CourseTutorRepository>(
          Register.content.repository.CourseTutorRepository
        );

        const associateTutorToCourseUseCase = container.get<AssociateTutorToCourseUseCase>(
          Register.content.useCase.AssociateTutorToCourseUseCase
        );

        // Find tutors to remove (in original list but not in new list)
        const tutorsToRemove = originalTutors.filter(
          original => !selectedTutors.some(selected => selected.id === original.id)
        );

        // Find tutors to add (in new list but not in original list)
        const tutorsToAdd = selectedTutors.filter(
          selected => !originalTutors.some(original => original.id === selected.id)
        );

        // Remove tutors
        for (const tutorToRemove of tutorsToRemove) {
          try {
            // Find the course-tutor association
            const association = await courseTutorRepository.findByUserAndCourse(
              tutorToRemove.id,
              newCourseId
            );

            if (association) {
              // Delete the association
              await courseTutorRepository.delete(association.id);
              console.log(`Removed tutor ${tutorToRemove.email} from course`);
            }
          } catch (removeErr) {
            console.error(`Error removing tutor ${tutorToRemove.email}:`, removeErr);
            // Continue even if removal fails
          }
        }

        // Add new tutors
        for (const tutorToAdd of tutorsToAdd) {
          try {
            await associateTutorToCourseUseCase.execute({
              userId: tutorToAdd.id,
              courseId: newCourseId
            });
            console.log(`Added tutor ${tutorToAdd.email} to course`);
          } catch (addErr) {
            console.error(`Error associating tutor ${tutorToAdd.email}:`, addErr);
            // Continue even if association fails
          }
        }
      } else if (selectedTutors.length > 0) {
        // For new courses, add all selected tutors
        const associateTutorToCourseUseCase = container.get<AssociateTutorToCourseUseCase>(
          Register.content.useCase.AssociateTutorToCourseUseCase
        );

        // Add each selected tutor
        for (const tutorToAdd of selectedTutors) {
          try {
            await associateTutorToCourseUseCase.execute({
              userId: tutorToAdd.id,
              courseId: newCourseId
            });
            console.log(`Added tutor ${tutorToAdd.email} to course`);
          } catch (associateErr) {
            console.error(`Error associating tutor ${tutorToAdd.email}:`, associateErr);
            // Continue even if association fails
          }
        }
      }

      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: isEditMode ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!',
        type: 'success'
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        router.push('/admin/courses');
      }, 1000);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} course:`, error);

      // Update loading toast to error
      const errorMessage = `Falha ao ${isEditMode ? 'atualizar' : 'criar'} curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      showToast.update(loadingToastId, {
        render: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (name: string, config: FieldConfig): ReactNode => {
    if (!(name in formData)) return null;

    const commonProps = {
      id: name,
      name,
      value: formData[name as keyof FormData],
      onChange: handleChange,
      required: config.required
    };

    return (
      <div key={name} className="space-y-2">
        <label htmlFor={name} className="text-sm font-medium">
          {config.label}
        </label>

        {config.type === 'text' && (
          <InputText
            {...commonProps}
            placeholder={config.placeholder}
          />
        )}

        {config.type === 'textarea' && (
          <textarea
            {...commonProps}
            placeholder={config.placeholder}
            rows={(config as TextareaFieldConfig).rows || 4}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          />
        )}

        {config.type === 'select' && (
          <SelectComponent
            value={formData[name as keyof FormData] as string}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, [name]: value }));
            }}
            options={(config as SelectFieldConfig).options}
            placeholder={config.placeholder || `Selecione ${config.label.toLowerCase()}`}
            className="w-full"
          />
        )}
      </div>
    );
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

  if (error && isEditMode) {
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
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Editar Curso' : 'Criar novo curso'}
            </h1>
            <Link href="/admin/courses">
              <Button variant='primary'>Voltar</Button>
            </Link>
          </div>

          <Card>
            <FormSection onSubmit={handleSubmit} error={error}>
              <CardHeader>
                <CardTitle>
                  {isEditMode ? 'Informações do curso' : 'Informações do curso'}
                </CardTitle>
                {isEditMode && (
                  <CardDescription>
                    Atualize os detalhes de {formData.title}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {error && !isEditMode && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!isEditMode && renderFormField('institutionId', {
                    type: 'select',
                    label: 'Instituição',
                    required: true,
                    placeholder: 'Selecione uma instituição',
                    options: institutions.map(institution => ({
                      value: institution.id,
                      label: institution.name
                    }))
                  })}

                  {renderFormField('title', {
                    type: 'text',
                    label: 'Titulo do curso',
                    placeholder: 'Adicione um titulo ao curso',
                    required: true
                  })}
                </div>

                {renderFormField('description', {
                  type: 'textarea',
                  label: 'Descrição',
                  placeholder: 'Adicione uma descrição',
                  required: true,
                  rows: 4
                })}

                {/* Instructor/Tutor selection */}
                <div className="space-y-2">
                  <label htmlFor="tutorSelect" className="block text-sm font-medium text-gray-700 mt-4">
                    Instrutor
                  </label>

                  {selectedTutors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-3">Tutores Selecionados ({selectedTutors.length})</h4>
                      <div className="space-y-3">
                        {selectedTutors.map((tutor) => (
                          <div key={tutor.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{tutor.email}</div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => {
                                setSelectedTutors(prev =>
                                  prev.filter(t => t.id !== tutor.id)
                                );
                              }}
                              className="bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 flex items-center gap-1 whitespace-nowrap min-w-fit"
                              aria-label="Remover tutor"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <SelectComponent
                    value={selectedTutorId}
                    onChange={(value) => {
                      if (value) {
                        const tutor = tutors.find(t => t.id === value);
                        if (tutor && !selectedTutors.some(selected => selected.id === tutor.id)) {
                          setSelectedTutors(prev => [
                            ...prev,
                            { id: tutor.id, email: tutor.email.value }
                          ]);
                          setSelectedTutorId('');
                        }
                      }
                    }}
                    options={tutors
                      .filter(tutor => !selectedTutors.some(selected => selected.id === tutor.id))
                      .map(tutor => ({
                        value: tutor.id,
                        label: `${tutor.name} (${tutor.email.value})`
                      }))}
                    placeholder="Selecione um instrutor"
                  />
                  <p className="text-gray-500 text-xs">
                    Selecione instrutores para este curso
                  </p>
                </div>

                {/* Cover Image URL Field */}
                <div className="space-y-2">
                  <label htmlFor="coverImageUrl" className="text-sm font-medium">
                    URL da Imagem <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    id="coverImageUrl"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                  />
                  <p className="text-gray-500 text-xs">
                    Adicione uma URL para a imagem de capa do curso (obrigatório)
                  </p>
                </div>

              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-4">
                <Link href="/admin/courses">
                  <Button
                    variant='secondary'>
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant='primary'
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (isEditMode ? 'Salvando...' : 'Criando...')
                    : (isEditMode ? 'Salvar Alterações' : 'Criar Curso')
                  }
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
