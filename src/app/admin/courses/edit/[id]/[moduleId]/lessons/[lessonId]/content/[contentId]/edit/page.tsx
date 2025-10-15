'use client'

import React, { useState, useEffect, use} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { FormSection } from '@/components/form'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { showToast } from '@/components/toast'

interface ContentFormData {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  lessonId: string;
}

export default function EditContentPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string, contentId: string }> }) { 

  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId, contentId } = unwrappedParams;
  
  const [formData, setFormData] = useState<ContentFormData>({
    id: '',
    title: '',
    type: ContentType.VIDEO,
    url: '',
    lessonId: ''
  })
  
  const [lessonTitle, setLessonTitle] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setIsLoading(true)
        
        const contentRepository = container.get<ContentRepository>(
          Register.content.repository.ContentRepository
        )
        
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )
        
        const content = await contentRepository.findById(contentId)
        
        if (!content) {
          setError('Conteúdo não encontrado')
          setIsLoading(false)
          return
        }
        
        const lesson = await lessonRepository.findById(lessonId)
        
        if (!lesson) {
          setError('Lição não encontrada')
          setIsLoading(false)
          return
        }
        
        setLessonTitle(lesson.title)
        
        const moduleData = await moduleRepository.findById(moduleId)
        
        if (!moduleData) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }
        
        setModuleName(moduleData.title)
        
        setFormData({
          id: content.id,
          title: content.title,
          type: content.type,
          url: content.url,
          lessonId: content.lessonId
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching content data:', error)
        const errorMessage = 'Falha ao carregar dados do conteúdo'
        setError(errorMessage)
        showToast.error(errorMessage)
        setIsLoading(false)
      }
    }

    fetchContentData()
  }, [contentId, lessonId, moduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Show loading toast
    const loadingToastId = showToast.loading('Atualizando conteúdo...')
    
    try {

      const contentRepository = container.get<ContentRepository>(
        Register.content.repository.ContentRepository
      )
      
      const content = await contentRepository.findById(contentId)
      
      if (!content) {
        throw new Error('Conteúdo não encontrado')
      }
      
      content.updateTitle(formData.title)
      
      // Update URL for video content
      if (formData.type === ContentType.VIDEO && formData.url !== content.url) {
        content.url = formData.url
      }
      
      await contentRepository.save(content)
      
      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Conteúdo atualizado com sucesso!',
        type: 'success'
      })
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`)
      }, 1000)
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      
      // Update loading toast to error
      const errorMessage = `Falha ao atualizar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      showToast.update(loadingToastId, {
        render: errorMessage,
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    // Show loading toast
    const loadingToastId = showToast.loading('Excluindo conteúdo...')
    
    try {

      const contentRepository = container.get<ContentRepository>(
        Register.content.repository.ContentRepository
      )
      
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )
      
      const deleted = await contentRepository.delete(contentId)
      
      if (!deleted) {
        throw new Error('Conteúdo não encontrado')
      }
      
      const lesson = await lessonRepository.findById(lessonId)
      
      if (!lesson) {
        throw new Error('Lição não encontrada')
      }
      
      lesson.contents = lesson.contents.filter(content => content.id !== contentId)
      
      await lessonRepository.save(lesson)
      
      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Conteúdo excluído com sucesso!',
        type: 'success'
      })
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`)
      }, 1000)
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error)
      
      // Update loading toast to error
      const errorMessage = `Falha ao excluir conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      showToast.update(loadingToastId, {
        render: errorMessage,
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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
      case ContentType.SCORM:
        return 'SCORM';
      case ContentType.AUDIO:
        return 'Áudio';
      default:
        return 'Conteúdo';
    }
  }

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // If it's already an embed URL or other format, return as is
    return url;
  };

  const renderContentPreview = () => {
    switch (formData.type) {
      case ContentType.VIDEO:
        const embedUrl = getEmbedUrl(formData.url);
        if (!embedUrl) {
          return (
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mb-2 mx-auto"
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
                <p className="text-sm text-gray-500">Insira uma URL válida para visualizar o vídeo</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Preview"
            ></iframe>
          </div>
        );
      case ContentType.PDF:
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
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
            <p className="text-sm text-gray-500 mb-4">Documento PDF</p>
            <a
              href={formData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Abrir PDF em nova aba
            </a>
          </div>
        );
      case ContentType.AUDIO:
        return (
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
            <audio
              controls
              className="w-full"
              src={formData.url}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
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
            <p className="text-sm text-gray-500 mb-4">Tipo de conteúdo não suportado para visualização</p>
            <a
              href={formData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Abrir conteúdo em nova aba
            </a>
          </div>
        );
    }
  };

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
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Editar Conteúdo</h1>
              <p className="text-gray-500">Lição: {lessonTitle}</p>
              <p className="text-gray-500">Módulo: {moduleName}</p>
            </div>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
              <Button className="border border-gray-300 bg-transparent hover:bg-gray-100">Voltar para a Lição</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Conteúdo</CardTitle>
              <CardDescription>
                Atualize os detalhes do conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit} error={null} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título do Conteúdo
                  </label>
                  <InputText
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Digite o título do conteúdo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tipo de Conteúdo
                  </label>
                  <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    {getContentTypeLabel(formData.type)}
                  </div>
                </div>

                {formData.type === ContentType.VIDEO && (
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                      URL do Vídeo
                    </label>
                    <InputText
                      id="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="Cole aqui o link do vídeo (YouTube, Vimeo, etc.)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suporte para YouTube, Vimeo, e outros links de vídeo. Cole o link completo do vídeo.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Pré-visualização
                  </label>
                  {renderContentPreview()}
                </div>
      
                <div className="flex justify-between gap-2 mt-6">
                  <div>
                    {showDeleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">Confirmar exclusão?</span>
                        <Button 
                          type="button" 
                          className="bg-red-600 text-white hover:bg-red-700 text-xs py-1"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                        </Button>
                        <Button 
                          type="button" 
                          className="border border-gray-300 bg-transparent hover:bg-gray-100 text-xs py-1"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSubmitting}
                      >
                        Excluir Conteúdo
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                      <Button className="border border-gray-300 bg-transparent hover:bg-gray-100" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting || isDeleting}>
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              </FormSection>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
