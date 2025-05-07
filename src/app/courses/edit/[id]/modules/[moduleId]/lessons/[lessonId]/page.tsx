'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { InputText } from '@/components/input'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository'
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { Content } from '@/_core/modules/content/core/entities/Content'

// Define lesson data type for the UI
interface LessonFormData {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  contents: ContentData[];
  activity?: ActivityData;
  questionnaire?: QuestionnaireData;
}

// Define content data type for the UI
interface ContentData {
  id: string;
  title: string;
  type: ContentType;
  url: string;
}

// Define activity data type for the UI
interface ActivityData {
  id: string;
  description: string;
  instructions: string;
  resourceUrl?: string;
}

// Define questionnaire data type for the UI
interface QuestionnaireData {
  id: string;
  title: string;
  maxAttempts: number;
  passingScore: number;
  questions: QuestionData[];
}

// Define question data type for the UI
interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function EditLessonPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> | { id: string, moduleId: string, lessonId: string } }) {
  const router = useRouter()
  // Use React.use() to unwrap params if it's a Promise
  const resolvedParams = 'then' in params ? use(params) : params
  const { id: courseId, moduleId, lessonId } = resolvedParams
  
  const [formData, setFormData] = useState<LessonFormData>({
    id: '',
    title: '',
    moduleId: '',
    order: 0,
    contents: []
  })
  
  const [moduleName, setModuleName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true)
        
        // Get the repositories from the container
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )
        
        const activityRepository = container.get<ActivityRepository>(
          Register.content.repository.ActivityRepository
        )
        
        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        )
        
        // Fetch the lesson by ID
        const lesson = await lessonRepository.findById(lessonId)

        console.log("Lesson from repository:", lesson)
        
        if (!lesson) {
          setError('Lição não encontrada')
          setIsLoading(false)
          return
        }
        
        // Fetch the module to get its name
        const module = await moduleRepository.findById(moduleId)
        
        if (!module) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }
        
        setModuleName(module.title)
        
        // Map contents to UI data
        const contentsData: ContentData[] = lesson.contents.map(content => ({
          id: content.id,
          title: content.title,
          type: content.type,
          url: content.url
        }))
        
        // Check for activity in the activity repository
        const activity = await activityRepository.findByLessonId(lessonId)
        console.log("Activity from repository:", activity)
        
        // Map activity data if it exists
        let activityData: ActivityData | undefined = undefined;
        if (lesson.activity) {
          activityData = {
            id: lesson.activity.id,
            description: lesson.activity.description,
            instructions: lesson.activity.instructions,
            resourceUrl: lesson.activity.resourceUrl
          };
        } else if (activity) {
          // Use activity from repository if not in lesson
          activityData = {
            id: activity.id,
            description: activity.description,
            instructions: activity.instructions,
            resourceUrl: activity.resourceUrl
          };
        }
        
        // Check for questionnaire in the questionnaire repository
        const questionnaire = await questionnaireRepository.findByLessonId(lessonId)
        console.log("Questionnaire from repository:", questionnaire)
        
        // Map questionnaire data if it exists
        let questionnaireData: QuestionnaireData | undefined = undefined;
        if (lesson.questionnaire) {
          questionnaireData = {
            id: lesson.questionnaire.id,
            title: lesson.questionnaire.title,
            maxAttempts: lesson.questionnaire.maxAttempts,
            passingScore: lesson.questionnaire.passingScore,
            questions: lesson.questionnaire.questions.map(q => ({
              id: q.id,
              questionText: q.questionText,
              options: q.options,
              correctAnswerIndex: q.correctAnswerIndex
            }))
          };
        } else if (questionnaire) {
          // Use questionnaire from repository if not in lesson
          questionnaireData = {
            id: questionnaire.id,
            title: questionnaire.title,
            maxAttempts: questionnaire.maxAttempts,
            passingScore: questionnaire.passingScore,
            questions: questionnaire.questions.map(q => ({
              id: q.id,
              questionText: q.questionText,
              options: q.options,
              correctAnswerIndex: q.correctAnswerIndex
            }))
          };
        }
        
        // Map Lesson entity to form data
        setFormData({
          id: lesson.id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          order: lesson.order,
          contents: contentsData,
          activity: activityData,
          questionnaire: questionnaireData
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching lesson data:', error)
        setError('Falha ao carregar dados da lição')
        setIsLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId, moduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Get the repositories from the container
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )
      
      const activityRepository = container.get<ActivityRepository>(
        Register.content.repository.ActivityRepository
      )
      
      const questionnaireRepository = container.get<QuestionnaireRepository>(
        Register.content.repository.QuestionnaireRepository
      )
      
      // Fetch the current lesson
      const lesson = await lessonRepository.findById(lessonId)
      
      if (!lesson) {
        throw new Error('Lição não encontrada')
      }
      
      // Update the lesson title
      lesson.updateTitle(formData.title)
      
      // Check for activity in the activity repository
      const activity = await activityRepository.findByLessonId(lessonId)
      if (activity && !lesson.activity) {
        // Attach activity to lesson if it exists in repository but not in lesson
        lesson.attachActivity(activity)
      }
      
      // Check for questionnaire in the questionnaire repository
      const questionnaire = await questionnaireRepository.findByLessonId(lessonId)
      if (questionnaire && !lesson.questionnaire) {
        // Attach questionnaire to lesson if it exists in repository but not in lesson
        lesson.attachQuestionnaire(questionnaire)
      }
      
      // Save the updated lesson
      await lessonRepository.save(lesson)
      
      console.log('Lição atualizada com sucesso')
      
      // Redirect back to the module edit page
      router.push(`/tutor/courses/edit/${courseId}/modules/${moduleId}`)
    } catch (error) {
      console.error('Erro ao atualizar lição:', error)
      alert(`Falha ao atualizar lição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case ContentType.VIDEO:
        return 'Vídeo';
      case ContentType.PDF:
        return 'PDF';
      case ContentType.PODCAST:
        return 'Podcast';
      default:
        return 'Conteúdo';
    }
  }

  const getContentTypeIcon = (type: ContentType): React.ReactNode => {
    switch (type) {
      case ContentType.VIDEO:
        return (
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case ContentType.PDF:
        return (
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
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case ContentType.PODCAST:
        return (
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        );
      default:
        return (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedContent>
    )
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
                <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}`}>
              <Button>Voltar para o Módulo</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Editar Lição</h1>
              <p className="text-gray-500">Módulo: {moduleName}</p>
            </div>
            <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}`}>
              <Button className="border bg-transparent hover:bg-gray-100">Voltar para o Módulo</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Lição</CardTitle>
              <CardDescription>
                Atualize os detalhes da lição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSection onSubmit={handleSubmit} error={error}>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título da Lição
                  </label>
                  <InputText
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Digite o título da lição"
                    required
                  />
                </div>
                
                {/* Contents Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Conteúdos da Lição</CardTitle>
                      <div className="flex gap-2">
                        <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/video-upload`}>
                          <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Adicionar Vídeo</Button>
                        </Link>
                        <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/activity/create`}>
                          <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Adicionar Atividade</Button>
                        </Link>
                        <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/questionnaire/create`}>
                          <Button className="text-xs px-3 py-1">Adicionar Questionário</Button>
                        </Link>
                      </div>
                    </div>
                    <CardDescription>
                      Gerencie os conteúdos desta lição
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.contents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Esta lição ainda não possui conteúdos. Adicione um conteúdo para começar.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.contents.map((content, index) => (
                          <div 
                            key={content.id} 
                            className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-500">
                                  {getContentTypeIcon(content.type)}
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {content.title}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {getContentTypeLabel(content.type)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/content/${content.id}/edit`}>
                                  <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Editar</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Section */}
                {formData.activity && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Atividade</CardTitle>
                      </div>
                      <CardDescription>
                        Atividade para os alunos realizarem
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              </div>
                              <h3 className="font-medium">
                                {formData.activity.description}
                              </h3>
                            </div>
                            <div className="ml-11 mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Instruções:</span> {formData.activity.instructions}
                              </p>
                              {formData.activity.resourceUrl && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  <span className="font-medium">Recurso:</span>{' '}
                                  <a 
                                    href={formData.activity.resourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {formData.activity.resourceUrl}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Questionnaire Section */}
                {formData.questionnaire && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Questionário</CardTitle>
                        <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/questionnaire/${formData.questionnaire.id}/questions`}>
                          <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Gerenciar Perguntas</Button>
                        </Link>
                      </div>
                      <CardDescription>
                        Questionário para avaliar o conhecimento dos alunos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
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
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <h3 className="font-medium">
                                {formData.questionnaire.title}
                              </h3>
                            </div>
                            <div className="ml-11 mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Tentativas máximas:</span> {formData.questionnaire.maxAttempts}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Nota de aprovação:</span> {formData.questionnaire.passingScore}%
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Número de perguntas:</span> {formData.questionnaire.questions.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Informações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ID da Lição</p>
                      <p className="text-sm font-mono">{formData.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ID do Módulo</p>
                      <p className="text-sm font-mono">{formData.moduleId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Ordem</p>
                      <p className="text-sm">{formData.order + 1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Número de Conteúdos</p>
                      <p className="text-sm">{formData.contents.length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 my-4">
                  <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}`}>
                    <Button className="border bg-transparent hover:bg-gray-100" type="button">Cancelar</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
