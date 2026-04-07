'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiUser, FiStar, FiCalendar } from 'react-icons/fi'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Button } from '@/components/button'
import { LoadingSpinner } from '@/components/loader'
import { container, Register } from '@/_core/shared/container'
import { ListNSScoreResponsesUseCase, ListNSScoreResponsesInput } from '@/_core/modules/nsscore/core/use-cases/list-responses'
import { ListNSScoreQuestionsUseCase, ListNSScoreQuestionsInput } from '@/_core/modules/nsscore/core/use-cases/list-questions'
import type { NSScoreResponse } from '@/_core/modules/nsscore/core/entities/NSScoreResponse'
import type { NSScoreQuestion } from '@/_core/modules/nsscore/core/entities/NSScoreQuestion'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'

export default function NSScoreResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = 'then' in params ? use(params) : params
  const courseId = resolvedParams.id

  const [responses, setResponses] = useState<NSScoreResponse[]>([])
  const [questions, setQuestions] = useState<NSScoreQuestion[]>([])
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [responsesResult, questionsResult] = await Promise.all([
          container.get<ListNSScoreResponsesUseCase>(Register.nsscore.useCase.ListNSScoreResponsesUseCase)
            .execute(new ListNSScoreResponsesInput(courseId)),
          container.get<ListNSScoreQuestionsUseCase>(Register.nsscore.useCase.ListNSScoreQuestionsUseCase)
            .execute(new ListNSScoreQuestionsInput(courseId)),
        ])

        setResponses(responsesResult.responses)
        setQuestions(questionsResult.questions)

        // Batch-fetch user names
        const userIds = [...new Set(responsesResult.responses.map(r => r.userId))]
        if (userIds.length > 0) {
          try {
            const userRepo = container.get<UserRepository>(Register.user.repository.UserRepository)
            const users = await userRepo.findByIds(userIds)
            const nameMap = new Map<string, string>()
            users.forEach(u => nameMap.set(u.id, u.name))
            setUserNames(nameMap)
          } catch { /* names not critical */ }
        }
      } catch {
        // fail silently — empty state handles it
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const averageScore = responses.length
    ? Math.round((responses.reduce((s, r) => s + r.score, 0) / responses.length) * 10) / 10
    : null

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/admin/courses/ns-score/${courseId}`}>
                <Button variant="secondary">
                  <FiArrowLeft className="mr-1" /> Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Respostas NS Score</h1>
            </div>
          </div>

          {/* Summary card */}
          {!loading && responses.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de respostas</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{responses.length}</p>
              </div>
              <div className="border rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/20 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nota média</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{averageScore}</p>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <LoadingSpinner />
          ) : responses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhuma resposta registrada para este curso.
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((r) => (
                <div key={r.id} className="border rounded-xl p-5 bg-white dark:bg-gray-800 space-y-3">
                  {/* Response header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FiUser className="w-4 h-4" />
                      <span className="font-medium">
                        {userNames.get(r.userId) || r.userId}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-base text-blue-600 dark:text-blue-400">
                        <FiStar className="w-4 h-4" />
                        {r.score}/10
                      </span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${r.score * 10}%` }}
                    />
                  </div>

                  {/* Question answers */}
                  {questions.length > 0 && r.questionAnswers.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {questions.map((q, qi) => {
                        const ans = r.questionAnswers.find(a => a.questionId === q.id)
                        if (!ans?.answer) return null
                        return (
                          <div key={q.id} className="text-sm">
                            <p
                              className="text-gray-500 dark:text-gray-400 prose dark:prose-invert max-w-none text-xs"
                              dangerouslySetInnerHTML={{ __html: `${qi + 1}. ${q.text}` }}
                            />
                            <p className="text-gray-800 dark:text-gray-200 mt-0.5 pl-3 border-l-2 border-blue-300">
                              {ans.answer}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
