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
import { Upload } from 'lucide-react'
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
  institutionId: string
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
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shadow-md">
              <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Conteúdo Interativo (SCORM)</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/scorm-upload`}>
              <Button variant='primary'>
                {scormContent ? 'Editar' : 'Adicionar'} SCORM
              </Button>
            </Link>
            {scormContent && (
              <Button
                variant='secondary'
                onClick={() => onDeleteContent(scormContent.id)}
                disabled={isSubmitting}
              >
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
