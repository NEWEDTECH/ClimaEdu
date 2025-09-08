'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { DropdownVideoPlayer } from '@/components/video'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import {
  getContentTypeIcon,
  getContentTypeLabel,
  getContentTypeColor,
} from './utils'

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

export function ContentSection({
  contents,
  courseId,
  moduleId,
  lessonId,
  onDeleteContent,
  isSubmitting
}: ContentSectionProps) {
  const videoContent = contents.find(c => c.type === ContentType.VIDEO)

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
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/video-upload`}>
              <Button className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {videoContent ? 'Editar' : 'Adicionar'} Vídeo
              </Button>
            </Link>
            {videoContent && (
              <Button
                className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3"
                onClick={() => onDeleteContent(videoContent.id)}
                disabled={isSubmitting}
              >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
                Excluir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!videoContent ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum vídeo adicionado
            </h3>
          </div>
        ) : (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getContentTypeColor(videoContent.type)} flex items-center justify-center shadow-md flex-shrink-0`}>
                <div className="text-white">
                  {getContentTypeIcon(videoContent.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <DropdownVideoPlayer
                  videoUrl={videoContent.url}
                  videoTitle={videoContent.title}
                  autoPlay={false}
                  showControls={true}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                    {videoContent.title}
                  </h3>
                </DropdownVideoPlayer>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {getContentTypeLabel(videoContent.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Clique para visualizar
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
