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
import { CreateQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/create-questionnaire/create-questionnaire.use-case';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';


type FormData = {
  title: string;
  maxAttempts: number;
  passingScore: number;
}

export default function CreateQuestionnairePage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId } = unwrappedParams;
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    maxAttempts: 3,
    passingScore: 70,
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
        
        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        );
        
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
          setError('Lição não encontrada');
          setIsLoading(false);
          return;
        }
        
        if (lesson.questionnaire) {
          setError('Esta lição já possui um questionário');
          setIsLoading(false);
          return;
        }
        
        const existingQuestionnaire = await questionnaireRepository.findByLessonId(lessonId);
        if (existingQuestionnaire) {
          setError('Esta lição já possui um questionário. Volte para a página da lição para visualizá-lo.');
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'maxAttempts' || name === 'passingScore' ? parseInt(value, 10) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {

      const createQuestionnaireUseCase = container.get<CreateQuestionnaireUseCase>(
        Register.content.useCase.CreateQuestionnaireUseCase
      );
      

      const result = await createQuestionnaireUseCase.execute({
        lessonId,
        title: formData.title,
        maxAttempts: formData.maxAttempts,
        passingScore: formData.passingScore,
      });
      
      router.push(`/tutor/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/questionnaire/${result.questionnaire.id}/questions`);
    } catch (error) {
      console.error('Erro ao criar questionário:', error);
      alert(`Falha ao criar questionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
                <Link href={`/tutor/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
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
            <h1 className="text-2xl font-bold mb-2">Criar Questionário</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Adicionar questionário à lição: <span className="font-medium">{lessonTitle}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Módulo: <span className="font-medium">{moduleName}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Novo Questionário</CardTitle>
              <CardDescription>
                Crie um questionário para avaliar o conhecimento dos alunos sobre o conteúdo da lição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit} error={error} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título do Questionário
                    </label>
                    <InputText
                      id="title"
                      placeholder="Digite um título para o questionário"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Um título claro que descreva o objetivo do questionário
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Número Máximo de Tentativas
                      </label>
                      <InputText
                        id="maxAttempts"
                        type="number"
                        min="1"
                        max="10"
                        name="maxAttempts"
                        value={formData.maxAttempts.toString()}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Quantas vezes o aluno pode tentar responder o questionário
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nota de Aprovação (%)
                      </label>
                      <InputText
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        name="passingScore"
                        value={formData.passingScore.toString()}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Porcentagem mínima para aprovação no questionário
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Próximos Passos</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Após criar o questionário, você será redirecionado para adicionar perguntas. 
                    Você pode adicionar quantas perguntas desejar, cada uma com múltiplas alternativas.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                    <Button
                      type="button"
                      className="border-2 bg-transparent hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Criar Questionário'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para Criar Questionários Eficazes</CardTitle>
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
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Perguntas Claras e Objetivas</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Formule perguntas diretas e sem ambiguidades para evitar confusão.
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
                    <p className="font-medium">Alternativas Plausíveis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Crie alternativas que pareçam razoáveis, evitando opções obviamente incorretas.
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Dificuldade Progressiva</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comece com perguntas mais fáceis e aumente gradualmente a dificuldade.
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
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cobertura Abrangente</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Crie perguntas que cubram todos os principais tópicos da lição.
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
