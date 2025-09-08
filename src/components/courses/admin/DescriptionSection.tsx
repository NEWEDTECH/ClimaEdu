'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'

interface DescriptionSectionProps {
  description: string
  courseId: string
  moduleId: string
  lessonId: string
  onDelete: () => void
  isSubmitting: boolean
}

export function DescriptionSection({
  description,
  courseId,
  moduleId,
  lessonId,
  onDelete,
  isSubmitting
}: DescriptionSectionProps) {
  if (!description) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span>Descrição da Lição</span>
            </CardTitle>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/description`}>
              <Button variant='primary'>
                Adicionar Descrição
              </Button>
            </Link>
          </div>
          <CardDescription>
            Adicione uma descrição detalhada para contextualizar a lição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma descrição criada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Adicione uma descrição rica e detalhada para fornecer contexto e orientações aos estudantes.
            </p>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/description`}>
              <Button variant='primary'>
                Criar Descrição
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span>Descrição da Lição</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/description`}>
              <Button variant='primary'>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Descrição
              </Button>
            </Link>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/description`}>
              <Button variant='secondary'>
                Editar
              </Button>
            </Link>
            <Button 
              variant='secondary'
              onClick={onDelete}
              disabled={isSubmitting}
            >
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
                Conteúdo da Descrição
              </h4>
              <div 
                className="prose prose-sm max-w-none text-indigo-800 dark:text-indigo-200 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:visited]:text-purple-600 dark:[&_a]:text-blue-400 dark:[&_a:hover]:text-blue-300 dark:[&_a:visited]:text-purple-400"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
