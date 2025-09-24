'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
//import { ProtectedContent } from '@/components/auth';
import { DashboardLayout } from '@/components/layout';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { SubmitQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/submit-questionnaire/submit-questionnaire.use-case';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Question } from '@/_core/modules/content/core/entities/Question';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { useProfile } from '@/context/zustand/useProfile';
import { Button } from '@/components/button'

type QuestionAnswer = {
  questionId: string;
  selectedOptionIndex: number | null;
}

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const { infoUser } = useProfile();
  
  const courseId = typeof params?.id === 'string' ? params.id : '';
  const questionnaireId = typeof params?.questionnaireId === 'string' ? params.questionnaireId : '';

  const [course, setCourse] = useState<Course | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Load course and questionnaire data
  useEffect(() => {
    const fetchData = async () => {
      if (!questionnaireId || !courseId) return;

      try {
        setIsLoading(true);
        
        // First, fetch the course to get the institutionId
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );

        const courseData = await courseRepository.findById(courseId);
        
        if (!courseData) {
          setError('Curso não encontrado');
          return;
        }

        setCourse(courseData);

        // Then fetch the questionnaire
        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        );

        const questionnaireData = await questionnaireRepository.findById(questionnaireId);
        
        if (!questionnaireData) {
          setError('Questionário não encontrado');
          return;
        }

        setQuestionnaire(questionnaireData);

        // Initialize answers array
        const initialAnswers: QuestionAnswer[] = questionnaireData.questions.map(question => ({
          questionId: question.id,
          selectedOptionIndex: null
        }));
        setAnswers(initialAnswers);

        // Get attempt count if user is logged in
        if (infoUser.id) {
          const submissionRepository = container.get<QuestionnaireSubmissionRepository>(
            Register.content.repository.QuestionnaireSubmissionRepository
          );

          const attempts = await submissionRepository.countAttempts(
            questionnaireId,
            infoUser.id
          );
          setAttemptCount(attempts);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [questionnaireId, courseId, infoUser.id]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, selectedOptionIndex: optionIndex }
          : answer
      )
    );
  };

  // Check if all questions are answered
  const isAllQuestionsAnswered = () => {
    return answers.every(answer => answer.selectedOptionIndex !== null);
  };

  // Handle questionnaire submission
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

      await submitQuestionnaireUseCase.execute({
        questionnaireId: questionnaire.id,
        userId: infoUser.id,
        institutionId: course.institutionId,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          selectedOptionIndex: answer.selectedOptionIndex!
        }))
      });

      router.push(`/student/courses/${courseId}`);

    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar questionário');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back to course
  const handleBackToCourse = () => {
    router.push(`/student/courses/${courseId}`);
  };

  if (isLoading) {
    return (

        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
              <Button
                onClick={handleBackToCourse}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar ao Curso
              </Button>
            </div>
          </div>
        </DashboardLayout>

    );
  }

  if (!questionnaire) {
    return null;
  }

  // Check if user has exceeded max attempts
  const hasExceededAttempts = attemptCount >= questionnaire.maxAttempts;

  return (

      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={handleBackToCourse}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao Curso
            </Button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {questionnaire.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">Total de Perguntas</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {questionnaire.questions.length}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-green-600 dark:text-green-400 font-medium">Nota de Aprovação</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {questionnaire.passingScore}%
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <div className="text-orange-600 dark:text-orange-400 font-medium">Tentativas Máximas</div>
                  <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    {questionnaire.maxAttempts}
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-purple-600 dark:text-purple-400 font-medium">Tentativas Usadas</div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {attemptCount}
                  </div>
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

          {/* Questions */}
          {!hasExceededAttempts && (
            <div className="space-y-6">
              {questionnaire.questions.map((question: Question, questionIndex: number) => {
                const currentAnswer = answers.find(a => a.questionId === question.id);
                
                return (
                  <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {questionIndex + 1}. {question.questionText}
                    </h3>
                    
                    <div className="space-y-3">
                      {question.options.map((option: string, optionIndex: number) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-150 ${
                            currentAnswer?.selectedOptionIndex === optionIndex
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnswerSelect(question.id, optionIndex);
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionIndex}
                            checked={currentAnswer?.selectedOptionIndex === optionIndex}
                            onChange={(e) => {
                              e.preventDefault();
                              handleAnswerSelect(question.id, optionIndex);
                            }}
                            className="sr-only"
                          />
                          
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                            currentAnswer?.selectedOptionIndex === optionIndex
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {currentAnswer?.selectedOptionIndex === optionIndex && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
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

              {/* Error Message */}
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

              {/* Submit Button */}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Questionário'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    
  );
}
