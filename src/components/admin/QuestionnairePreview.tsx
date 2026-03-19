'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/button';
import 'quill/dist/quill.snow.css';

export type PreviewQuestion = {
  questionText: string;
  options: string[];
}

type Props = {
  title: string;
  maxAttempts: number;
  passingScore: number;
  questions: PreviewQuestion[];
  onClose: () => void;
}

export function QuestionnairePreview({ questions, onClose }: Props) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(selected).length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="min-h-full max-w-4xl mx-auto px-4 py-8">
        {/* Barra de topo */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 px-4 py-3">
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Modo de visualização
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-800/40 transition-colors"
            aria-label="Fechar visualização"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Header igual ao do estudante */}


        {/* Perguntas */}
        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-gray-500">
            Nenhuma pergunta adicionada ainda.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, questionIndex) => {
              const selectedIndex = selected[questionIndex] ?? null;
              return (
                <div key={questionIndex} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-6">
                  <div className="mb-4">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 block mb-2">
                      Pergunta {questionIndex + 1}:
                    </span>
                    <div
                      className="ql-editor !pl-0 text-lg font-semibold text-gray-900 dark:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: question.questionText }}
                    />
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${
                          selectedIndex === optionIndex
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setSelected(prev => ({ ...prev, [questionIndex]: optionIndex }))}
                      >
                        <input
                          type="radio"
                          name={`preview-q-${questionIndex}`}
                          checked={selectedIndex === optionIndex}
                          onChange={() => setSelected(prev => ({ ...prev, [questionIndex]: optionIndex }))}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                          selectedIndex === optionIndex ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedIndex === optionIndex && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 ${
                            selectedIndex === optionIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">{option}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Rodapé */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Perguntas respondidas: {answeredCount} de {questions.length}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={onClose}>
                    Fechar visualização
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
