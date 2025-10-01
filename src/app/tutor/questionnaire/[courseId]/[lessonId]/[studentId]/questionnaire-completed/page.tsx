'use client';

import React, { useEffect, useState, use } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import type { SubmissionWithContext } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.output';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import type { Course } from '@/_core/modules/content/core/entities/Course';
import type { User } from '@/_core/modules/user/core/entities/User';

export default function QuestionnaireCompletedPage({ params }: { params: Promise<{ courseId: string, lessonId:string, studentId: string }> }) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const { courseId, studentId } = resolvedParams;
  
  const [submissions, setSubmissions] = useState<SubmissionWithContext[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  useEffect(() => {
    const fetchData = async () => {
      if (!tutorId || !institutionId || !courseId || !studentId) {
        setError('Parâmetros inválidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar dados do curso
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const courseData = await courseRepository.findById(courseId);
        if (!courseData) {
          throw new Error('Curso não encontrado');
        }
        setCourse(courseData);

        // Buscar dados do estudante
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        );
        const studentData = await userRepository.findById(studentId);
        if (!studentData) {
          throw new Error('Estudante não encontrado');
        }
        setStudent(studentData);

        // Buscar submissões diretamente do repositório seguindo o padrão que funciona
        const submissionRepository = container.get<QuestionnaireSubmissionRepository>(
          Register.content.repository.QuestionnaireSubmissionRepository
        );

        // Buscar submissões diretamente por courseId, userId e institutionId
        const submissions = await submissionRepository.listByCourseUserAndInstitution(
          courseId,
          studentId,
          institutionId
        );

        console.log('Submissions encontradas:', submissions);

        // Buscar dados relacionados para cada submissão
        const submissionsWithContext: SubmissionWithContext[] = [];

        for (const submission of submissions) {
          try {
            console.log('Processando submission:', submission.id, 'questionnaireId:', submission.questionnaireId);
            
            // Buscar questionário
            const questionnaireRepository = container.get<QuestionnaireRepository>(
              Register.content.repository.QuestionnaireRepository
            );
            const questionnaire = await questionnaireRepository.findById(submission.questionnaireId);
            console.log('Questionnaire encontrado:', questionnaire ? questionnaire.id : 'null');
            if (!questionnaire) continue;

            // Buscar lição para obter o título
            const lessonRepository = container.get<LessonRepository>(
              Register.content.repository.LessonRepository
            );
            const lesson = await lessonRepository.findById(questionnaire.lessonId);
            console.log('Lesson encontrada:', lesson ? lesson.id : 'null');
            
            // Se não encontrar a lição, usar título padrão
            const lessonTitle = lesson ? lesson.title : 'Lição não encontrada';

            console.log('Adicionando submission ao contexto');
            submissionsWithContext.push({
              submission,
              questionnaire,
              student: studentData,
              course: courseData,
              lessonTitle
            });
          } catch (error) {
            console.error('Error processing submission:', error);
            continue;
          }
        }

        setSubmissions(submissionsWithContext);
      } catch (err) {
        console.error('Error fetching questionnaire submissions:', err);
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados');
        showToast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId, institutionId, courseId, studentId]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreColor = (score: number, passed: boolean) => {
    if (passed) {
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    } else {
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    }
  };

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Erro</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => window.history.back()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => window.history.back()}
              className="flex items-cente mb-4 transition-colors"
            >
              Voltar
            </Button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Questionários Completados
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Curso</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {course?.title || 'Carregando...'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estudante</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {student?.name || 'Carregando...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum questionário encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Este estudante ainda não completou nenhum questionário neste curso.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submissionData, index) => (
                <div key={`${submissionData.submission.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Submission Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {submissionData.questionnaire.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Lição: {submissionData.lessonTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(submissionData.submission.score, submissionData.submission.passed)}`}>
                          {submissionData.submission.score}%
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tentativa {submissionData.submission.attempt}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Iniciado em:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(submissionData.submission.startedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Completado em:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(submissionData.submission.completedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Nota mínima:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {submissionData.questionnaire.passingScore}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <p className={`font-medium ${submissionData.submission.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {submissionData.submission.passed ? 'Aprovado' : 'Reprovado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Questions and Answers */}
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Respostas do Questionário
                    </h4>
                    
                    <div className="space-y-4">
                      {submissionData.submission.questions.map((questionSubmission, qIndex) => {
                        const question = submissionData.questionnaire.questions.find(q => q.id === questionSubmission.questionId);
                        if (!question) return null;

                        return (
                          <div key={questionSubmission.questionId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {qIndex + 1}. {question.questionText}
                              </h5>
                              <div className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                                questionSubmission.isCorrect 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {questionSubmission.isCorrect ? 'Correto' : 'Incorreto'}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => {
                                const isSelected = questionSubmission.selectedOptionIndex === optionIndex;
                                const isCorrect = question.correctAnswerIndex === optionIndex;
                                
                                let optionClass = 'p-3 rounded border ';
                                if (isSelected && isCorrect) {
                                  optionClass += 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400';
                                } else if (isSelected && !isCorrect) {
                                  optionClass += 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400';
                                } else if (!isSelected && isCorrect) {
                                  optionClass += 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-700 dark:text-green-300';
                                } else {
                                  optionClass += 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300';
                                }

                                return (
                                  <div key={optionIndex} className={optionClass}>
                                    <div className="flex items-center">
                                      <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium mr-3">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </span>
                                      <span className="flex-1">{option}</span>
                                      <div className="flex items-center space-x-2">
                                        {isSelected && (
                                          <span className="text-xs font-medium">Selecionada</span>
                                        )}
                                        {isCorrect && (
                                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
