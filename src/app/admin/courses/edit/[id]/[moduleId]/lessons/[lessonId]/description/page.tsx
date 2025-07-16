'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { LoadingSpinner } from '@/components/loader'
import { RichTextEditor } from '@/components/rich-text-editor/RichTextEditor'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'

export default function LessonDescriptionPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const { id: courseId, moduleId, lessonId } = unwrappedParams

  const [description, setDescription] = useState<string>('')
  const [lessonTitle, setLessonTitle] = useState<string>('')
  const [moduleName, setModuleName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )
        
        const lesson = await lessonRepository.findById(lessonId)
        if (!lesson) {
          setError('Lição não encontrada')
          setIsLoading(false)
          return
        }
        
        setLessonTitle(lesson.title)
        // Handle description property safely
        setDescription((lesson as any).description || '')
        
        const moduleData = await moduleRepository.findById(moduleId)
        if (!moduleData) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }
        
        setModuleName(moduleData.title)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Falha ao carregar dados')
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [lessonId, moduleId])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )
      
      const lesson = await lessonRepository.findById(lessonId)
      
      if (!lesson) {
        throw new Error('Lição não encontrada')
      }
      
      // Update lesson description
      // @ts-expect-error - We're manually updating the description property
      lesson.description = description
      
      await lessonRepository.save(lesson)
      
      router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`)
    } catch (error) {
      console.error('Erro ao salvar descrição:', error)
      alert(`Falha ao salvar descrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`)
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
                <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                  <Button>Voltar para a Lição</Button>
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
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Descrição da Lição</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Lição: <span className="font-medium">{lessonTitle}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Módulo: <span className="font-medium">{moduleName}</span>
                </p>
              </div>
              <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                <Button className="border border-gray-300 bg-white hover:bg-gray-50">
                  Voltar para a Lição
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Editor de Descrição</CardTitle>
              <CardDescription>
                Use o editor abaixo para criar uma descrição rica e detalhada da lição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Digite a descrição da lição aqui..."
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    className="border bg-white hover:bg-gray-100"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Descrição'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para uma Boa Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Seja Claro e Objetivo</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Explique claramente o que o aluno aprenderá nesta lição.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-green-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Use Listas e Tópicos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Organize o conteúdo em listas para facilitar a leitura.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-yellow-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M9 9v6M15 9v6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Destaque Pontos Importantes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use negrito e cores para destacar informações importantes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-purple-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Inclua Pré-requisitos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mencione conhecimentos necessários para a lição.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
