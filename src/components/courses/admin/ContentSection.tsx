'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { DropdownVideoPlayer } from '@/components/video'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'

interface ContentData {
  id: string
  title: string
  type: ContentType
  url: string
}

interface ContentSectionProps {
  contents: ContentData[]
  courseId: string
  moduleId: string
  lessonId: string
  onDeleteContent: (contentId: string) => void
  isSubmitting: boolean
}

const getContentTypeLabel = (type: ContentType): string => {
  switch (type) {
    case ContentType.VIDEO:
      return 'Vídeo'
    case ContentType.PDF:
      return 'PDF'
    case ContentType.PODCAST:
      return 'Podcast'
    case ContentType.SCORM:
      return 'SCORM'
    default:
      return 'Conteúdo'
  }
}

const getContentTypeIcon = (type: ContentType) => {
  switch (type) {
    case ContentType.VIDEO:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    case ContentType.PDF:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case ContentType.PODCAST:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    case ContentType.SCORM:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 4-4-4 4-4" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

const getContentTypeColor = (type: ContentType) => {
  switch (type) {
    case ContentType.VIDEO:
      return 'from-blue-500 to-indigo-600'
    case ContentType.PDF:
      return 'from-red-500 to-pink-600'
    case ContentType.PODCAST:
      return 'from-purple-500 to-violet-600'
    case ContentType.SCORM:
      return 'from-green-500 to-teal-600'
    default:
      return 'from-gray-500 to-slate-600'
  }
}

export function ContentSection({
  contents,
  courseId,
  moduleId,
  lessonId,
  onDeleteContent,
  isSubmitting
}: ContentSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span>Vídeo Aula</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/scorm-upload`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar SCORM
              </Button>
            </Link>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/video-upload`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Vídeo
              </Button>
            </Link>
            {contents.length > 0 && (
              <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/content/${contents[0].id}/edit`}>
                <Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3 py-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </Button>
              </Link>
            )}
            <Button
              className="border border-red-300 text-xs px-3 py-1 bg-red-500 text-white hover:bg-red-600"
              onClick={() => onDeleteContent(contents[0].id)}
              disabled={isSubmitting}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum conteúdo adicionado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Adicione vídeos, PDFs ou podcasts para enriquecer o conteúdo desta lição.
            </p>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/video-upload`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Adicionar Primeiro Conteúdo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getContentTypeColor(contents[0].type)} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <div className="text-white">
                    {getContentTypeIcon(contents[0].type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {contents[0].type === ContentType.VIDEO ? (
                    <DropdownVideoPlayer
                      videoUrl={contents[0].url}
                      videoTitle={contents[0].title}
                      autoPlay={false}
                      showControls={true}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                        {contents[0].title}
                      </h3>
                    </DropdownVideoPlayer>
                  ) : (
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {contents[0].title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {getContentTypeLabel(contents[0].type)}
                    </span>
                    {contents[0].type === ContentType.VIDEO && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Clique para visualizar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
