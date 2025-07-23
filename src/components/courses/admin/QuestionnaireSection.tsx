'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'

interface QuestionData {
  id: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

interface QuestionnaireData {
  id: string
  title: string
  maxAttempts: number
  passingScore: number
  questions: QuestionData[]
}

interface QuestionnaireSectionProps {
  questionnaire?: QuestionnaireData
  courseId: string
  moduleId: string
  lessonId: string
  onDelete: () => void
  isSubmitting: boolean
}

export function QuestionnaireSection({
  questionnaire,
  courseId,
  moduleId,
  lessonId,
  onDelete,
  isSubmitting
}: QuestionnaireSectionProps) {
  if (!questionnaire) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Questionário</span>
            </CardTitle>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/questionnaire/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Questionário
              </Button>
            </Link>
          </div>
          <CardDescription>
            Crie um questionário para avaliar o conhecimento dos estudantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum questionário criado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Crie um questionário para avaliar o conhecimento dos estudantes sobre esta lição.
            </p>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/questionnaire/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Criar Primeiro Questionário
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Questionário</span>
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/questionnaire/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Questionário
              </Button>
            </Link>
            <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}/questionnaire/${questionnaire.id}`}>
              <Button className="border border-purple-300 bg-white hover:bg-purple-50 text-purple-700 text-xs px-3 py-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            </Link>
            <Button 
              className="border border-red-300 text-xs px-3 py-1 bg-red-500 text-white hover:bg-red-600"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="space-y-6">
            {/* Header with title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  {questionnaire.title}
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Avaliação de conhecimento da lição
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 dark:bg-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Tentativas Máximas
                    </p>
                    <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                      {questionnaire.maxAttempts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Nota de Aprovação
                    </p>
                    <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                      {questionnaire.passingScore}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Total de Perguntas
                    </p>
                    <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                      {questionnaire.questions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions preview */}
            {questionnaire.questions.length > 0 && (
              <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
                <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Prévia das Perguntas
                </h5>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {questionnaire.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="bg-white/30 dark:bg-purple-800/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                        {index + 1}. {question.questionText}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.slice(0, 2).map((option, optIndex) => (
                          <div key={optIndex} className="text-xs text-purple-700 dark:text-purple-300 bg-white/50 dark:bg-purple-800/30 px-2 py-1 rounded">
                            {String.fromCharCode(65 + optIndex)}. {option.length > 30 ? option.substring(0, 30) + '...' : option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {questionnaire.questions.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        +{questionnaire.questions.length - 3} perguntas adicionais
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
