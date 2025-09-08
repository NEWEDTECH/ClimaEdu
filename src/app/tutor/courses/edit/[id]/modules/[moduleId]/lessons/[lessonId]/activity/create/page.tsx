'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { FormSection } from '@/components/form';
import { LoadingSpinner } from '@/components/loader';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CreateActivityUseCase } from '@/_core/modules/content/core/use-cases/create-activity/create-activity.use-case';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';

type FormData = {
  description: string;
  instructions: string;
  resourceUrl: string;
}

export default function CreateActivityPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId } = unwrappedParams;
  
  const [formData, setFormData] = useState<FormData>({
    description: '',
    instructions: '',
    resourceUrl: '',
  });
  
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [moduleName, setModuleName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        );
        
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        );
        
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
          setError('Lição não encontrada');
          setIsLoading(false);
          return;
        }
        
        if (lesson.activity) {
          setError('Esta lição já possui uma atividade');
          setIsLoading(false);
          return;
        }
        
        setLessonTitle(lesson.title);
        
        const moduleData = await moduleRepository.findById(moduleId);
        if (!moduleData) {
          setError('Módulo não encontrado');
          setIsLoading(false);
          return;
        }
        
        setModuleName(moduleData.title);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Falha ao carregar dados');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const createActivityUseCase = container.get<CreateActivityUseCase>(
        Register.content.useCase.CreateActivityUseCase
      );
      
      interface ActivityParams {
        lessonId: string;
        description: string;
        instructions: string;
        resourceUrl?: string;
      }
      
      const params: ActivityParams = {
        lessonId,
        description: formData.description,
        instructions: formData.instructions,
      };
      
      if (formData.resourceUrl.trim() !== '') {
        params.resourceUrl = formData.resourceUrl;
      }
      
      await createActivityUseCase.execute(params);
      
      router.push(`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      alert(`Falha ao criar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
                <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                  <Button>Voltar para a Lição</Button>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Criar Atividade</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Adicionar atividade à lição: <span className="font-medium">{lessonTitle}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Módulo: <span className="font-medium">{moduleName}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nova Atividade</CardTitle>
              <CardDescription>
                Crie uma atividade para os alunos realizarem após estudarem o conteúdo da lição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit} error={null} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descrição da Atividade
                    </label>
                    <InputText
                      id="description"
                      placeholder="Digite uma descrição clara da atividade"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uma breve descrição do que os alunos devem fazer
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Instruções Detalhadas
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
                      placeholder="Forneça instruções detalhadas sobre como realizar a atividade"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Explique passo a passo o que os alunos devem fazer, critérios de avaliação, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL de Recurso
                    </label>
                    <InputText
                      id="resourceUrl"
                      placeholder="https://exemplo.com/recurso"
                      name="resourceUrl"
                      value={formData.resourceUrl}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link para um recurso externo que pode ajudar na realização da atividade
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                    <Button
                      type="button"
                      variant='secondary'
                    >
                      Cancelar
                    </Button>
                  </Link>
                  
                  <Button
                    type="submit"
                    variant='primary'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Criar Atividade'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para Criar Atividades Eficazes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Seja Claro e Específico</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Forneça instruções claras e objetivas para evitar confusão.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-green-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Defina Critérios de Avaliação</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Explique como a atividade será avaliada para que os alunos saibam o que é esperado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-yellow-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Estabeleça Prazos Razoáveis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defina um prazo adequado para a conclusão da atividade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-purple-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Conecte com o Conteúdo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Certifique-se de que a atividade reforce o aprendizado do conteúdo da lição.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
