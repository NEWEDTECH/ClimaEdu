'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProfile } from '@/context/zustand/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { LoadingSpinner } from '@/components/loader'
import { CourseEditLayout } from '@/components/courses/CourseEditLayout'
import { ActivitySection, ContentSection, DescriptionSection, Mp3UploadSection, PdfUploadSection, QuestionnaireSection, ScormSection } from '@/components/courses/admin'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository'
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository'
import { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository'
import { UpdateLessonDescriptionUseCase } from '@/_core/modules/content/core/use-cases/update-lesson-description/update-lesson-description.use-case'
import { RemoveContentFromLessonUseCase } from '@/_core/modules/content/core/use-cases/remove-content-from-lesson/remove-content-from-lesson.use-case'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { showToast } from '@/components/toast'

type LessonFormData = {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  contents: ContentData[];
  activity?: ActivityData;
  questionnaire?: QuestionnaireData;
}

type ContentData = {
  id: string;
  title: string;
  type: ContentType;
  url: string;
}

type ActivityData = {
  id: string;
  description: string;
  instructions: string;
  resourceUrl?: string;
}

type QuestionnaireData = {
  id: string;
  title: string;
  maxAttempts: number;
  passingScore: number;
  questions: QuestionData[];
}

type QuestionData = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function EditLessonPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> }) {
  const router = useRouter()
  const { infoUser } = useProfile()

  const resolvedParams = 'then' in params ? use(params) : params
  const { id: courseId, moduleId, lessonId } = resolvedParams
  
  const [formData, setFormData] = useState<LessonFormData>({
    id: '',
    title: '',
    moduleId: '',
    order: 0,
    contents: []
  })
  
  const [lessonDescription, setLessonDescription] = useState<string>('')
  const [moduleName, setModuleName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true)
        

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
        

        const lesson = await lessonRepository.findById(lessonId)
 
        if (!lesson) {
          setError('Lição não encontrada')
          setIsLoading(false)
          return
        }
        
        const moduleData = await moduleRepository.findById(moduleId)
        
        if (!moduleData) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }
        
        setModuleName(moduleData.title)
        
        const contentsData: ContentData[] = lesson.contents.map(content => ({
          id: content.id,
          title: content.title,
          type: content.type,
          url: content.url
        }))
        

        const activity = await activityRepository.findByLessonId(lessonId)

        let activityData: ActivityData | undefined = undefined;
        if (lesson.activity) {
          activityData = {
            id: lesson.activity.id,
            description: lesson.activity.description,
            instructions: lesson.activity.instructions,
            resourceUrl: lesson.activity.resourceUrl
          };
        } else if (activity) {

          activityData = {
            id: activity.id,
            description: activity.description,
            instructions: activity.instructions,
            resourceUrl: activity.resourceUrl
          };
        }
        
        const questionnaire = await questionnaireRepository.findByLessonId(lessonId)

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
        
        setFormData({
          id: lesson.id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          order: lesson.order,
          contents: contentsData,
          activity: activityData,
          questionnaire: questionnaireData
        })
        
        // Set lesson description
        setLessonDescription(lesson.description || '')
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching lesson data:', error)
        const errorMessage = 'Falha ao carregar dados da lição'
        setError(errorMessage)
        showToast.error(errorMessage)
        setIsLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId, moduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteQuestionnaire = async () => {
    if (!formData.questionnaire) return
    
    if (!confirm('Tem certeza que deseja excluir este questionário? Esta ação não pode ser desfeita.')) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )
      
      const questionnaireRepository = container.get<QuestionnaireRepository>(
        Register.content.repository.QuestionnaireRepository
      )
      
      const lesson = await lessonRepository.findById(lessonId)
      
      if (!lesson) {
        throw new Error('Lição não encontrada')
      }
      
      // Delete the questionnaire
      const deleted = await questionnaireRepository.delete(formData.questionnaire.id)
      
      if (!deleted) {
        throw new Error('Não foi possível excluir o questionário')
      }
      
      // Remove the questionnaire reference from the lesson
      lesson.questionnaire = undefined
      
      // Save the updated lesson
      await lessonRepository.save(lesson)
      
      // Update the UI state
      setFormData(prev => ({
        ...prev,
        questionnaire: undefined
      }))
      
      showToast.success('Questionário excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir questionário:', error)
      showToast.error(`Falha ao excluir questionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteActivity = async () => {
    if (!formData.activity) return
    
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
      return
    }
    
    try {
      const activityRepository = container.get<ActivityRepository>(
        Register.content.repository.ActivityRepository
      )
      
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )
      
      // Delete the activity
      const deleted = await activityRepository.delete(formData.activity.id)
      
      if (!deleted) {
        throw new Error('Não foi possível excluir a atividade')
      }
      
      // Update lesson to remove activity reference
      const lesson = await lessonRepository.findById(lessonId)
      if (lesson) {
        lesson.activity = undefined
        await lessonRepository.save(lesson)
      }
      
      // Update UI state
      setFormData(prev => ({
        ...prev,
        activity: undefined
      }))
      
      showToast.success('Atividade excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir atividade:', error)
      showToast.error('Falha ao excluir atividade')
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Tem certeza que deseja remover este conteúdo da lição?')) {
      return
    }

    try {
      const removeContentUseCase = container.get<RemoveContentFromLessonUseCase>(
        Register.content.useCase.RemoveContentFromLessonUseCase
      );

      await removeContentUseCase.execute({ lessonId, contentId });

      // Update UI state
      setFormData(prev => ({
        ...prev,
        contents: prev.contents.filter(content => content.id !== contentId)
      }));

      showToast.success('Conteúdo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover conteúdo:', error);
      showToast.error(`Falha ao remover conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  const handleDeleteDescription = async () => {
    if (!confirm('Tem certeza que deseja excluir a descrição desta lição?')) {
      return
    }
    
    try {
      const updateLessonDescriptionUseCase = container.get<UpdateLessonDescriptionUseCase>(
        Register.content.useCase.UpdateLessonDescriptionUseCase
      )
      
      await updateLessonDescriptionUseCase.execute({
        lessonId,
        description: ''
      })
      
      setLessonDescription('')
      showToast.success('Descrição excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir descrição:', error)
      showToast.error('Falha ao excluir descrição')
    }
  }

  const handleDeleteLesson = async () => {
    if (!confirm('Tem certeza que deseja excluir esta lição? Esta ação não pode ser desfeita e todos os conteúdos, atividades e questionários associados serão removidos.')) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Show loading toast
      const loadingToastId = showToast.loading('Excluindo lição...')
      
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
      
      const contentRepository = container.get<ContentRepository>(
        Register.content.repository.ContentRepository
      )
      
      // Get the lesson to delete
      const lesson = await lessonRepository.findById(lessonId)
      
      if (!lesson) {
        throw new Error('Lição não encontrada')
      }
      
      // Delete all associated content
      for (const content of lesson.contents) {
        await contentRepository.delete(content.id)
      }
      
      // Delete associated activity if exists
      if (lesson.activity) {
        await activityRepository.delete(lesson.activity.id)
      }
      
      // Delete associated questionnaire if exists
      if (lesson.questionnaire) {
        await questionnaireRepository.delete(lesson.questionnaire.id)
      }
      
      // Delete the lesson itself
      const deleted = await lessonRepository.delete(lessonId)
      
      if (!deleted) {
        throw new Error('Não foi possível excluir a lição')
      }
      
      // Get the module and remove the lesson reference
      const moduleData = await moduleRepository.findById(moduleId)
      if (moduleData) {
        moduleData.lessons = moduleData.lessons.filter(l => l.id !== lessonId)
        await moduleRepository.save(moduleData)
      }
      
      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Lição excluída com sucesso!',
        type: 'success'
      })
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        router.push(`/admin/courses/edit/${courseId}/${moduleId}`)
      }, 1000)
    } catch (error) {
      console.error('Erro ao excluir lição:', error)
      
      // Update loading toast to error
      const errorMessage = `Falha ao excluir lição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      showToast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <CourseEditLayout courseId={courseId}>
        <div className="container mx-auto p-6 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </CourseEditLayout>
    )
  }

  if (error) {
    return (
      <CourseEditLayout courseId={courseId}>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
              <p className="mb-4">{error}</p>
              <Link href={`/admin/courses/edit/${courseId}`}>
                <Button>Voltar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </CourseEditLayout>
    )
  }

  return (
    <CourseEditLayout courseId={courseId}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Editar Lição</h1>
            <p className="text-gray-500">Módulo: {moduleName}</p>
          </div>
          <Link href={`/admin/courses/edit/${courseId}`}>
            <Button className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">Voltar</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Lição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                readOnly
              />
            </div>
            
            {/* Content Section */}
            <ContentSection
              contents={formData.contents}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              onDeleteContent={handleDeleteContent}
              isSubmitting={isSubmitting}
            />

            {/* Scorm Section */}
            <ScormSection
              contents={formData.contents}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              institutionId={infoUser?.currentIdInstitution}
              onDeleteContent={handleDeleteContent}
              isSubmitting={isSubmitting}
            />

            {/* PDF Upload Section */}
            <PdfUploadSection
              contents={formData.contents}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              institutionId={infoUser?.currentIdInstitution}
              onDeleteContent={handleDeleteContent}
              onContentAdded={() => window.location.reload()}
              isSubmitting={isSubmitting}
            />

            {/* MP3 Upload Section */}
            <Mp3UploadSection
              contents={formData.contents}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              institutionId={infoUser?.currentIdInstitution}
              onDeleteContent={handleDeleteContent}
              onContentAdded={() => window.location.reload()}
              isSubmitting={isSubmitting}
            />

            {/* Description Section */}
            <DescriptionSection
              description={lessonDescription}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              onDelete={handleDeleteDescription}
              isSubmitting={isSubmitting}
            />

            {/* Activity Section */}
            <ActivitySection
              activity={formData.activity}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              onDelete={handleDeleteActivity}
              isSubmitting={isSubmitting}
            />

            {/* Questionnaire Section */}
            <QuestionnaireSection
              questionnaire={formData.questionnaire}
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lessonId}
              onDelete={handleDeleteQuestionnaire}
              isSubmitting={isSubmitting}
            />

            <div className="flex justify-end gap-2 my-4">
              <Button 
                onClick={handleDeleteLesson} 
                disabled={isSubmitting}
                variant='primary'
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir Lição'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourseEditLayout>
  )
}
