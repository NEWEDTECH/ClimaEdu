"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListQuestionnaireSubmissionsForTutorUseCase } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.use-case';
import type { SubmissionWithContext } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.output';

export default function TutorQuestionnaireCompletedPage() {
  const params = useParams();
  const studentId = params.id as string;
  
  const [submissions, setSubmissions] = useState<SubmissionWithContext[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  const fetchSubmissions = useCallback(async () => {
    if (!tutorId || !institutionId) {
      setError('Informações do tutor não encontradas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 DEBUG: Iniciando busca de questionários');
      console.log('📋 Parâmetros:', { tutorId, institutionId, studentId });

      const useCase = container.get<ListQuestionnaireSubmissionsForTutorUseCase>(
        Register.content.useCase.ListQuestionnaireSubmissionsForTutorUseCase
      );

      const result = await useCase.execute({
        tutorId,
        institutionId,
        studentId: studentId || undefined
      });

      console.log('📝 Submissões encontradas:', result.submissions.length);
      console.log('📝 Detalhes das submissões:', result.submissions.map(s => ({
        submissionId: s.submission.id,
        studentId: s.submission.userId,
        studentName: s.student.name,
        questionnaireTitle: s.questionnaire.title,
        courseTitle: s.course.title,
        passed: s.submission.passed,
        score: s.submission.score
      })));

      setSubmissions(result.submissions);
    } catch (err) {
      console.error('❌ Error fetching questionnaire submissions:', err);
      setError('Falha ao carregar submissões de questionários. Tente novamente.');
      showToast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [tutorId, institutionId, studentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSubmissionSelect = (submissionId: string) => {
    setSelectedSubmission(submissionId);
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
  };

  const handleBackToStudents = () => {
    window.location.href = '/tutor/student-activities';
  };

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
    if (passed) return 'text-green-600 dark:text-green-400';
    return score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  };

  const renderSubmissionsList = () => (
    <>
      <div className="mb-6 mt-6">
        <Button 
          variant="primary" 
          onClick={handleBackToStudents}
          className="mb-4"
        >
          ← Voltar para Atividades dos Alunos
        </Button>
        <h1 className="text-2xl font-bold mb-2">
          {studentId ? 'Questionários do Aluno' : 'Questionários Respondidos'}
        </h1>
       
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
              📋
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Este aluno ainda não respondeu nenhum questionário.
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submissionContext) => (
            <Card 
              key={submissionContext.submission.id} 
              className={`hover:shadow-md transition-shadow ${
                submissionContext.submission.passed 
                  ? 'border-green-500 dark:border-green-700' 
                  : 'border-red-500 dark:border-red-700'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  {submissionContext.submission.passed ? (
                    <svg 
                      className="w-5 h-5 text-green-500 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5 text-red-500 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  )}
                  {submissionContext.questionnaire.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {!studentId && (
                    <p><strong>Aluno:</strong> {submissionContext.student.name}</p>
                  )}
                  <p><strong>Curso:</strong> {submissionContext.course.title}</p>
                  <p><strong>Lição:</strong> {submissionContext.lessonTitle}</p>
                  <p><strong>Data de realização:</strong> {formatDate(submissionContext.submission.completedAt)}</p>
                  <p><strong>Status:</strong> {submissionContext.submission.passed ? 'Aprovado' : 'Reprovado'}</p>
                  <p><strong>Nota:</strong> <span className={getScoreColor(submissionContext.submission.score, submissionContext.submission.passed)}>{submissionContext.submission.score}%</span></p>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Pontuação</span>
                    <span className={getScoreColor(submissionContext.submission.score, submissionContext.submission.passed)}>
                      {submissionContext.submission.score}%
                    </span>
                  </div>
                  <Progress 
                    value={submissionContext.submission.score} 
                    className={
                      submissionContext.submission.passed 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }
                  />
                </div>

                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Questões corretas:</span>
                    <span>{submissionContext.submission.questions.filter(q => q.isCorrect).length} de {submissionContext.submission.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nota mínima para aprovação:</span>
                    <span>{submissionContext.questionnaire.passingScore}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubmissionSelect(submissionContext.submission.id)}
                  variant="primary"
                >
                  Ver detalhes da submissão
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  const renderSubmissionDetail = () => {
    const submissionContext = submissions.find(s => s.submission.id === selectedSubmission);
    if (!submissionContext) return null;

    const { submission, questionnaire, student, course, lessonTitle } = submissionContext;

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de questionários
          </Button>
          <h1 className="text-2xl font-bold mb-2">{questionnaire.title}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Aluno:</strong> {student.name}</p>
            <p><strong>Curso:</strong> {course.title}</p>
            <p><strong>Lição:</strong> {lessonTitle}</p>
            <p><strong>Data de realização:</strong> {formatDate(submission.completedAt)}</p>
          </div>
        </div>

        <Card className={`mb-6 ${
          submission.passed 
            ? 'border-green-500 dark:border-green-700' 
            : 'border-red-500 dark:border-red-700'
        }`}>
          <CardHeader>
            <CardTitle className={
              submission.passed 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }>
              Resultado: {submission.passed ? 'Aprovado' : 'Reprovado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span>Pontuação</span>
                <span className={
                  submission.passed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }>
                  {submission.score}%
                </span>
              </div>
              <Progress 
                value={submission.score} 
                className={
                  submission.passed 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }
              />
              <div className="flex justify-between text-sm mt-1">
                <span>Nota mínima: {questionnaire.passingScore}%</span>
                <span>Tempo gasto: {Math.round((submission.completedAt.getTime() - submission.startedAt.getTime()) / (1000 * 60))} minutos</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questões corretas:</span>
                <span>{submission.questions.filter(q => q.isCorrect).length} de {submission.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tentativa:</span>
                <span>{submission.attempt} de {questionnaire.maxAttempts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Revisão das Questões</h2>

        <div className="space-y-6">
          {questionnaire.questions.map((question, index) => {
            const questionSubmission = submission.questions.find(qs => qs.questionId === question.id);
            const isCorrect = questionSubmission?.isCorrect || false;
            const selectedOptionIndex = questionSubmission?.selectedOptionIndex;

            return (
              <Card 
                key={question.id} 
                className={`${
                  isCorrect 
                    ? 'border-green-500 dark:border-green-700' 
                    : 'border-red-500 dark:border-red-700'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    {isCorrect ? (
                      <svg 
                        className="w-5 h-5 text-green-500 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        className="w-5 h-5 text-red-500 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    )}
                    Questão {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.questionText}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-md border ${
                          selectedOptionIndex === optIndex && !isCorrect
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                            : question.correctAnswerIndex === optIndex
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {selectedOptionIndex === optIndex && !isCorrect && (
                            <svg 
                              className="w-5 h-5 text-red-500 mr-2" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                              />
                            </svg>
                          )}
                          {question.correctAnswerIndex === optIndex && (
                            <svg 
                              className="w-5 h-5 text-green-500 mr-2" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          )}
                          {!(selectedOptionIndex === optIndex && !isCorrect) && 
                            question.correctAnswerIndex !== optIndex && (
                            <div className="w-5 h-5 mr-2"></div>
                          )}
                          {option}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
            <Button onClick={handleBackToStudents}>
              Voltar para Atividades dos Alunos
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {selectedSubmission ? renderSubmissionDetail() : renderSubmissionsList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
