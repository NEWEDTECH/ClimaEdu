'use client'

import type { NSScoreQuestion } from '@/_core/modules/nsscore/core/entities/NSScoreQuestion'
import type { QuestionAnswer } from '@/_core/modules/nsscore/core/entities/NSScoreResponse'

interface NSScoreModalProps {
  nsScore: number
  nsQuestions: NSScoreQuestion[]
  nsAnswers: QuestionAnswer[]
  nsSubmitting: boolean
  onScoreChange: (score: number) => void
  onAnswerChange: (questionId: string, answer: string) => void
  onSubmit: () => void
  onDismiss: () => void
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: NSScoreQuestion
  value: string
  onChange: (v: string) => void
}) {
  const base =
    'w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400'

  switch (question.fieldType) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Sua resposta..."
          className={base}
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className={base}
        />
      )

    case 'boolean':
      return (
        <div className="flex gap-2">
          {(['Sim', 'Não'] as const).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                value === opt
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )

    case 'rating':
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors cursor-pointer ${
                Number(value) >= n
                  ? 'bg-yellow-400 border-yellow-400 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 hover:border-yellow-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      )

    case 'textarea':
    default:
      return (
        <textarea
          rows={2}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Sua resposta..."
          className={`${base} resize-none`}
        />
      )
  }
}

export function NSScoreModal({
  nsScore,
  nsQuestions,
  nsAnswers,
  nsSubmitting,
  onScoreChange,
  onAnswerChange,
  onSubmit,
  onDismiss,
}: NSScoreModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Parabéns! Você concluiu o curso!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avalie sua experiência</p>
        </div>

        {/* 0-10 rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nota geral do curso:{' '}
            <span className="text-blue-600 font-bold">{nsScore}</span>
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => onScoreChange(i)}
                className={`w-9 h-9 rounded-full text-sm font-bold cursor-pointer transition-colors ${
                  nsScore === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        {nsQuestions.length > 0 && (
          <div className="space-y-4">
            {nsQuestions.map((q, i) => (
              <div key={q.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span
                    className="prose dark:prose-invert text-sm"
                    dangerouslySetInnerHTML={{ __html: `${i + 1}. ${q.text}` }}
                  />
                </label>
                <QuestionInput
                  question={q}
                  value={nsAnswers.find(a => a.questionId === q.id)?.answer ?? ''}
                  onChange={v => onAnswerChange(q.id, v)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onDismiss}
            disabled={nsSubmitting}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
          >
            Agora não
          </button>
          <button
            onClick={onSubmit}
            disabled={nsSubmitting}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer disabled:opacity-50"
          >
            {nsSubmitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  )
}
