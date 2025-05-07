'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/card';
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
  enrolledStudents?: number;
  createdAt?: string;
  updatedAt?: string;
}

const additionalFieldsConfig: Record<string, FieldConfig> = {
  instructor: {
    type: 'text',
    label: 'Instrutor',
    placeholder: 'Adicione um nome ao instrutor'
  },
  category: {
    type: 'text',
    label: 'Categoria',
    placeholder: 'Adicione uma categoria'
  },
  level: {
    type: 'select',
    label: 'Nível',
    options: [
      { value: 'beginner', label: 'Básico' },
      { value: 'intermediate', label: 'Intermediário' },
      { value: 'advanced', label: 'Avançado' }
    ]
  },
  duration: {
    type: 'text',
    label: 'Duração',
    placeholder: '12 semanas'
  },
  status: {
    type: 'select',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' }
    ]
  }
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const isEditMode = !!courseId;

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    institutionId: '',
    instructor: '',
    duration: '',
    category: '',
    level: 'beginner',
    status: 'active',
    enrolledStudents: 0
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );

        const institutionsList = await institutionRepository.list();

        const institutionsForDropdown = institutionsList.map(institution => ({
          id: institution.id,
          name: institution.name
        }));

        setInstitutions(institutionsForDropdown);

        if (isEditMode && courseId) {
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
              enrolledStudents: 0,
              createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : String(course.createdAt),
              updatedAt: course.updatedAt instanceof Date ? course.updatedAt.toISOString() : String(course.updatedAt)
            });
          } else {
            setError('Curso não encontrado');
          }
        } else if (institutionsForDropdown.length > 0) {

          setFormData(prev => ({ ...prev, institutionId: institutionsForDropdown[0].id }));
        }

        setError(null);
      } catch (err) {
        console.error(`Error fetching ${isEditMode ? 'course' : 'institutions'}:`, err);
        setError(`Falha ao carregar ${isEditMode ? 'curso' : 'instituições'}. Por favor, tente novamente.`);
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

    try {
      if (isEditMode && formData.id) {

        const updateCourseUseCase = container.get<UpdateCourseUseCase>(
          Register.content.useCase.UpdateCourseUseCase
        );

        await updateCourseUseCase.execute({
          id: formData.id,
          title: formData.title,
          description: formData.description
        });
      } else {

        const createCourseUseCase = container.get<CreateCourseUseCase>(
          Register.content.useCase.CreateCourseUseCase
        );

        await createCourseUseCase.execute({
          institutionId: formData.institutionId,
          title: formData.title,
          description: formData.description
        });
      }

      router.push('/admin/courses');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} course:`, error);
      alert(`Falha ao ${isEditMode ? 'atualizar' : 'criar'} curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
          <select
            {...commonProps}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          >
            {(config as SelectFieldConfig).options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
              <Button className="border border-gray-300 bg-transparent hover:bg-gray-100">Cancelar</Button>
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
                    options: [
                      { value: '', label: 'Selecione uma instituição' },
                      ...institutions.map(institution => ({
                        value: institution.id,
                        label: institution.name
                      }))
                    ]
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

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Informações Adicionais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(additionalFieldsConfig)
                      .filter(([fieldName]) => {

                        if (fieldName === 'status') return isEditMode;
                        return true;
                      })
                      .map(([fieldName, fieldConfig]) => (
                        renderFormField(fieldName, fieldConfig)
                      ))
                    }
                  </div>

                  {isEditMode && formData.enrolledStudents !== undefined && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Informações de Matrícula</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alunos matriculados atualmente: <span className="font-semibold">{formData.enrolledStudents}</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-4">
                <Link href="/admin/courses">
                  <Button className="border border-gray-300 bg-transparent hover:bg-gray-100" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
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
