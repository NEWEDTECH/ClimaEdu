'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'
import { FolderDown } from 'lucide-react'

interface ContentData {
  id: string
  title: string
  type: ContentType
  url: string
}

interface SupportMaterialSectionProps {
  contents: ContentData[]
  courseId: string
  moduleId: string
  lessonId: string
  institutionId: string
  onDeleteContent: (contentId: string) => void
  isSubmitting: boolean
}

export function SupportMaterialSection({
  contents,
  courseId,
  moduleId,
  lessonId,
  onDeleteContent,
  isSubmitting,
}: SupportMaterialSectionProps) {
  const supportMaterials = contents.filter(c => c.type === ContentType.SUPPORT_MATERIAL)

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📽️'
      case 'zip':
      case 'rar':
        return '🗜️'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'txt':
        return '📃'
      default:
        return '📁'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shadow-md">
              <FolderDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>Material de Apoio</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/support-material-upload`}>
              <Button variant='primary'>
                {supportMaterials.length > 0 ? 'Gerenciar' : 'Adicionar'} Materiais
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {supportMaterials.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum material de apoio adicionado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clique em &ldquo;Adicionar Materiais&rdquo; para começar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Materiais adicionados: {supportMaterials.length}
            </p>
            {supportMaterials.map((material) => (
              <div key={material.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">
                      {getFileIcon(material.title)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{material.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Material de Apoio
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={material.url.split('#storagePath=')[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Abrir
                    </a>
                    <Button
                      className="text-xs px-2 py-1 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => onDeleteContent(material.id)}
                      disabled={isSubmitting}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
