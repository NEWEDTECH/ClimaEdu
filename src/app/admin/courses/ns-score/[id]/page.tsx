'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Editor } from 'primereact/editor'
import 'quill/dist/quill.snow.css'
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Button } from '@/components/button'
import { LoadingSpinner } from '@/components/loader'
import { showToast } from '@/components/toast'
import { container, Register } from '@/_core/shared/container'
import type { NSScoreQuestion } from '@/_core/modules/nsscore/core/entities/NSScoreQuestion'
import { ListNSScoreQuestionsUseCase, ListNSScoreQuestionsInput } from '@/_core/modules/nsscore/core/use-cases/list-questions'
import { CreateNSScoreQuestionUseCase, CreateNSScoreQuestionInput } from '@/_core/modules/nsscore/core/use-cases/create-question'
import { DeleteNSScoreQuestionUseCase, DeleteNSScoreQuestionInput } from '@/_core/modules/nsscore/core/use-cases/delete-question'
import { useProfile } from '@/context/zustand/useProfile'

export default function NSScorePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = 'then' in params ? use(params) : params
  const courseId = resolvedParams.id
  const { infoUser } = useProfile()

  const [questions, setQuestions] = useState<NSScoreQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const useCase = container.get<ListNSScoreQuestionsUseCase>(
          Register.nsscore.useCase.ListNSScoreQuestionsUseCase
        )
        const result = await useCase.execute(new ListNSScoreQuestionsInput(courseId))
        setQuestions(result.questions)
      } catch {
        showToast.error('Erro ao carregar perguntas.')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [courseId])

  const handleCreate = async () => {
    if (!questionText.trim() || questionText === '<p><br></p>') {
      showToast.error('Escreva o texto da pergunta.')
      return
    }
    try {
      setSubmitting(true)
      const useCase = container.get<CreateNSScoreQuestionUseCase>(
        Register.nsscore.useCase.CreateNSScoreQuestionUseCase
      )
      const result = await useCase.execute(
        new CreateNSScoreQuestionInput(
          courseId,
          infoUser.currentIdInstitution,
          questionText,
          questions.length
        )
      )
      setQuestions(prev => [...prev, result.question])
      setQuestionText('')
      setShowForm(false)
      showToast.success('Pergunta criada.')
    } catch {
      showToast.error('Erro ao criar pergunta.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (question: NSScoreQuestion) => {
    if (!confirm(`Excluir a pergunta "${question.text.replace(/<[^>]*>/g, '').slice(0, 50)}..."?`)) return
    try {
      const useCase = container.get<DeleteNSScoreQuestionUseCase>(
        Register.nsscore.useCase.DeleteNSScoreQuestionUseCase
      )
      await useCase.execute(new DeleteNSScoreQuestionInput(question.id))
      setQuestions(prev => prev.filter(q => q.id !== question.id))
      showToast.success('Pergunta excluída.')
    } catch {
      showToast.error('Erro ao excluir pergunta.')
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/admin/courses/edit/${courseId}`}>
                <Button variant="secondary">
                  <FiArrowLeft className="mr-1" /> Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Perguntas NS Score</h1>
            </div>
            {!showForm && (
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <FiPlus className="mr-1 inline" /> Nova Pergunta
              </Button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="border rounded-xl p-5 space-y-4 bg-gray-50 dark:bg-gray-900">
              <h2 className="font-semibold">Nova Pergunta</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Texto da pergunta</label>
                <Editor
                  value={questionText}
                  onTextChange={e => setQuestionText(e.htmlValue ?? '')}
                  style={{ height: '180px' }}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" onClick={() => { setShowForm(false); setQuestionText('') }} disabled={submitting}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleCreate} disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar Pergunta'}
                </Button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {loading ? (
            <LoadingSpinner />
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhuma pergunta criada para este curso.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div
                    className="flex-1 text-sm prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  <button
                    onClick={() => handleDelete(q)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
