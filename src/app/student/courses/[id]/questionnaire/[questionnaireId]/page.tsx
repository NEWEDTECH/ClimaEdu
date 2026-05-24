'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ProtectedContent } from '@/components/auth';
import { DashboardLayout } from '@/components/layout';
import { container, Register } from '@/_core/shared/container';
import 'quill/dist/quill.snow.css';
import { SubmitQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/submit-questionnaire/submit-questionnaire.use-case';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Question } from '@/_core/modules/content/core/entities/Question';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { useProfile } from '@/context/zustand/useProfile';
import { Button } from '@/components/button';

type QuestionAnswer = {
  questionId: string;
  selectedOptionIndex: number | null;
};

type SubmissionResult = {
  score: number;
  passed: boolean;
  questions: Array<{
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }>;
};

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { infoUser } = useProfile();

  const courseId = typeof params?.id === 'string' ? params.id : '';
  const questionnaireId = typeof params?.questionnaireId === 'string' ? params.questionnaireId : '';
  const lessonId = searchParams.get('lessonId');

  const [course, setCourse] = useState<Course | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!questionnaireId || !courseId) return;

      try {
        setIsLoading(true);

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const courseData = await courseRepository.findById(courseId);
        if (!courseData) { setError('Curso não encontrado'); return; }
        setCourse(courseData);

        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        );
        const questionnaireData = await questionnaireRepository.findById(questionnaireId);
        if (!questionnaireData) { setError('Questionário não encontrado'); return; }
        setQuestionnaire(questionnaireData);

        setAnswers(questionnaireData.questions.map(q => ({ questionId: q.id, selectedOptionIndex: null })));

        if (infoUser.id) {
          const submissionRepository = container.get<QuestionnaireSubmissionRepository>(
            Register.content.repository.QuestionnaireSubmissionRepository
          );
          const attempts = await submissionRepository.countAttempts(questionnaireId, infoUser.id);
          setAttemptCount(attempts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [questionnaireId, courseId, infoUser.id]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev =>
      prev.map(a => a.questionId === questionId ? { ...a, selectedOptionIndex: optionIndex } : a)
    );
  };

  const isAllQuestionsAnswered = () => answers.every(a => a.selectedOptionIndex !== null);

  const handleSubmit = async () => {
    if (!questionnaire || !infoUser.id || !course) {
      setError('Dados de usuário ou curso não encontrados');
      return;
    }
    if (!isAllQuestionsAnswered()) {
      setError('Por favor, responda todas as perguntas antes de enviar');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const submitQuestionnaireUseCase = container.get<SubmitQuestionnaireUseCase>(
        Register.content.useCase.SubmitQuestionnaireUseCase
      );

      const output = await submitQuestionnaireUseCase.execute({
        questionnaireId: questionnaire.id,
        userId: infoUser.id,
        institutionId: course.institutionId,
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedOptionIndex: a.selectedOptionIndex!,
        })),
      });

      setResult({
        score: output.score,
        passed: output.passed,
        questions: output.submission.questions.map(q => ({
          questionId: q.questionId,
          selectedOptionIndex: q.selectedOptionIndex,
          isCorrect: q.isCorrect,
        })),
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar questionário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCourse = () => {
    const redirectUrl = lessonId
      ? `/student/courses/${courseId}?lesson=${lessonId}`
      : `/student/courses/${courseId}`;
    router.push(redirectUrl);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !questionnaire) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium mb-2">{error}</p>
            <Button onClick={handleBackToCourse} className="mt-4">Voltar ao Curso</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!questionnaire) return null;

  const hasExceededAttempts = attemptCount >= questionnaire.maxAttempts;

  // ── Tela de Resultado ──────────────────────────────────────────────────────
  if (result) {
    const correctCount = result.questions.filter(q => q.isCorrect).length;
    const totalCount = questionnaire.questions.length;

    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Placar */}
            <div className={`rounded-2xl p-8 text-center shadow-lg border-2 ${
              result.passed
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            }`}>
              <div className="text-6xl mb-3">{result.passed ? '🎉' : '😞'}</div>
              <h2 className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                {result.passed ? 'Aprovado!' : 'Reprovado'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {result.passed
                  ? 'Parabéns! Você atingiu a nota mínima.'
                  : `Você precisava de ${questionnaire.passingScore}% para passar.`}
              </p>

              <div className="flex justify-center gap-8">
                <div>
                  <div className={`text-5xl font-bold ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.score}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pontuação</div>
                </div>
                <div className="w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <div className="text-5xl font-bold text-gray-800 dark:text-gray-200">
                    {correctCount}/{totalCount}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acertos</div>
                </div>
              </div>
            </div>

            {/* Gabarito por pergunta */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Gabarito detalhado
            </h3>

            <div className="space-y-4">
              {questionnaire.questions.map((question: Question, qi: number) => {
                const qResult = result.questions.find(r => r.questionId === question.id);
                const isCorrect = qResult?.isCorrect ?? false;
                const selectedIdx = qResult?.selectedOptionIndex ?? -1;

                return (
                  <div
                    key={question.id}
                    className={`rounded-xl border-2 p-5 shadow-sm ${
                      isCorrect
                        ? 'border-green-300 dark:border-green-700 bg-white dark:bg-gray-800'
                        : 'border-red-300 dark:border-red-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {/* Cabeçalho da questão */}
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                          Pergunta {qi + 1}
                        </span>
                        <div
                          className="ql-editor !pl-0 !pt-0 text-gray-900 dark:text-gray-100 font-medium"
                          dangerouslySetInnerHTML={{ __html: question.questionText }}
                        />
                      </div>
                    </div>

                    {/* Opções */}
                    <div className="space-y-2 pl-10">
                      {question.options.map((option: string, oi: number) => {
                        const isSelected = selectedIdx === oi;
                        const isCorrectOption = question.correctAnswerIndex === oi;

                        let classes = 'flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm ';

                        if (isCorrectOption) {
                          classes += 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                        } else if (isSelected && !isCorrect) {
                          classes += 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                        } else {
                          classes += 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400';
                        }

                        return (
                          <div key={oi} className={classes}>
                            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCorrectOption
                                ? 'bg-green-500 text-white'
                                : isSelected && !isCorrect
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <span className="shrink-0 text-xs font-medium">
                                {isCorrect ? '✓ sua resposta' : '✗ sua resposta'}
                              </span>
                            )}
                            {isCorrectOption && !isSelected && (
                              <span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-400">
                                resposta correta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-2 pb-8">
              <Button onClick={handleBackToCourse} className="flex-1">
                Voltar ao Curso
              </Button>
            </div>

          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  // ── Tela do Questionário ───────────────────────────────────────────────────
  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <Button onClick={handleBackToCourse} className="flex items-center mb-4 transition-colors">
              Voltar ao Curso
            </Button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {questionnaire.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">Total de Perguntas</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{questionnaire.questions.length}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-green-600 dark:text-green-400 font-medium">Nota de Aprovação</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">{questionnaire.passingScore}%</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <div className="text-orange-600 dark:text-orange-400 font-medium">Tentativas Máximas</div>
                  <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{questionnaire.maxAttempts}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-purple-600 dark:text-purple-400 font-medium">Tentativas Usadas</div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{attemptCount}</div>
                </div>
              </div>

              {hasExceededAttempts && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      Você excedeu o número máximo de tentativas para este questionário.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Perguntas */}
          {!hasExceededAttempts && (
            <div className="space-y-6">
              {questionnaire.questions.map((question: Question, questionIndex: number) => {
                const currentAnswer = answers.find(a => a.questionId === question.id);

                return (
                  <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
                      {question.options.map((option: string, optionIndex: number) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${
                            currentAnswer?.selectedOptionIndex === optionIndex
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={e => { e.preventDefault(); handleAnswerSelect(question.id, optionIndex); }}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionIndex}
                            checked={currentAnswer?.selectedOptionIndex === optionIndex}
                            onChange={e => { e.preventDefault(); handleAnswerSelect(question.id, optionIndex); }}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                            currentAnswer?.selectedOptionIndex === optionIndex
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {currentAnswer?.selectedOptionIndex === optionIndex && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                              currentAnswer?.selectedOptionIndex === optionIndex
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

              {/* Erro */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {/* Enviar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Perguntas respondidas: {answers.filter(a => a.selectedOptionIndex !== null).length} de {questionnaire.questions.length}
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isAllQuestionsAnswered() || isSubmitting}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isAllQuestionsAnswered() && !isSubmitting
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </div>
                    ) : 'Enviar Questionário'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
