'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import {
  getContentTypeIcon,
  getContentTypeLabel,
  getContentTypeColor,
} from './utils'
import { ScormPlayer } from '@/components/scorm/ScormPlayer'

interface ContentData {
  id: string
  title: string
  type: ContentType
  url: string
}

interface ScormSectionProps {
  contents: ContentData[]
  courseId: string
  moduleId: string
  lessonId: string
  onDeleteContent: (contentId: string) => void
  isSubmitting: boolean
}

export function ScormSection({
  contents,
  courseId,
  moduleId,
  lessonId,
  onDeleteContent,
  isSubmitting,
}: ScormSectionProps) {
  const scormContent = contents.find(c => c.type === ContentType.SCORM)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4 4-4" />
              </svg>
            </div>
            <span>Conteúdo Interativo (SCORM)</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/scorm-upload`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {scormContent ? 'Editar' : 'Adicionar'} SCORM
              </Button>
            </Link>
            {scormContent && (
              <Button
                className="border border-red-300 text-xs px-3 py-1 bg-red-500 text-white hover:bg-red-600"
                onClick={() => onDeleteContent(scormContent.id)}
                disabled={isSubmitting}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!scormContent ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum conteúdo SCORM adicionado
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getContentTypeColor(scormContent.type)} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <div className="text-white">
                    {getContentTypeIcon(scormContent.type)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{scormContent.title}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {getContentTypeLabel(scormContent.type)}
                  </span>
                </div>
              </div>
            </div>
            <div className="aspect-video">
              <ScormPlayer contentId={scormContent.url} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
