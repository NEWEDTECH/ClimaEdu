'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import { ListQuestionnaireSubmissionsForTutorUseCase } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.use-case';
import type { SubmissionWithContext } from '@/_core/modules/content/core/use-cases/list-questionnaire-submissions-for-tutor/list-questionnaire-submissions-for-tutor.output';

export default function QuestionnaireCompletedGeneralPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithContext[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('');
  const [questionnaireFilter, setQuestionnaireFilter] = useState<string>('');
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    passedSubmissions: 0,
    failedSubmissions: 0,
    averageScore: 0
  });
  
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

      const useCase = container.get<ListQuestionnaireSubmissionsForTutorUseCase>(
        Register.content.useCase.ListQuestionnaireSubmissionsForTutorUseCase
      );

      const result = await useCase.execute({
        tutorId,
        institutionId
      });

      setSubmissions(result.submissions);
      setStats({
        totalSubmissions: result.totalSubmissions,
        passedSubmissions: result.passedSubmissions,
        failedSubmissions: result.failedSubmissions,
        averageScore: result.averageScore
      });
    } catch (err) {
      console.error('Error fetching questionnaire submissions:', err);
      setError('Falha ao carregar submissões de questionários. Tente novamente.');
      showToast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [tutorId, institutionId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Aplicar filtros
  const filteredSubmissions = submissions.filter((submission) => {
    const courseMatch = courseFilter === '' || 
      submission.course.title.toLowerCase().includes(courseFilter.toLowerCase());
    
    const studentMatch = studentFilter === '' || 
      submission.student.name.toLowerCase().includes(studentFilter.toLowerCase());
    
    const questionnaireMatch = questionnaireFilter === '' || 
      submission.questionnaire.title.toLowerCase().includes(questionnaireFilter.toLowerCase());
    
    return courseMatch && studentMatch && questionnaireMatch;
  });

  const handleViewSubmissionDetails = (studentId: string, submissionId: string) => {
    // Navegar para página de detalhes da submissão
    window.location.href = `/tutor/questionnaire/${studentId}/submission/${submissionId}`;
  };

  const handleViewStudentQuestionnaires = (studentId: string) => {
    // Navegar para página de questionários do aluno específico
    window.location.href = `/tutor/questionnaire/${studentId}/questionnaire-completed`;
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
    if (passed) return 'text-green-600';
    return score >= 50 ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusBadge = (passed: boolean) => {
    return passed 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Todos os Questionários Respondidos</h1>
              <p className="text-gray-600 mt-2">
                Visualize e analise todas as respostas dos questionários dos seus alunos
              </p>
            </div>
            <Button
              onClick={handleBackToStudents}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
            >
              <span>←</span>
              Voltar para Alunos
            </Button>
          </div>

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso
              </label>
              <InputText
                id="course-filter"
                placeholder="Digite o nome do curso..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Aluno
              </label>
              <InputText
                id="student-filter"
                placeholder="Digite o nome do aluno..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="questionnaire-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Questionário
              </label>
              <InputText
                id="questionnaire-filter"
                placeholder="Digite o nome do questionário..."
                value={questionnaireFilter}
                onChange={(e) => setQuestionnaireFilter(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  📋
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Submissões</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  ✅
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.passedSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  ❌
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failedSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  📊
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Submissões */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className={`overflow-x-auto ${filteredSubmissions.length > 8 ? 'max-h-96 overflow-y-auto' : ''}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso / Lição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questionário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pontuação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
                          📋
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {submissions.length === 0 ? 'Nenhuma submissão encontrada' : 'Nenhum resultado encontrado'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {submissions.length === 0 
                            ? 'Ainda não há questionários respondidos pelos seus alunos.'
                            : 'Tente ajustar os filtros de busca.'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submissionContext, index) => (
                      <tr key={`${submissionContext.submission.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              👤
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {submissionContext.student.name}
                              </div>
                              <button
                                onClick={() => handleViewStudentQuestionnaires(submissionContext.student.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Ver todos questionários
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submissionContext.course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submissionContext.lessonTitle}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submissionContext.questionnaire.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getScoreColor(submissionContext.submission.score, submissionContext.submission.passed)}`}>
                            {submissionContext.submission.score}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(submissionContext.submission.passed)}`}>
                            {submissionContext.submission.passed ? 'Aprovado' : 'Reprovado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(submissionContext.submission.completedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => handleViewSubmissionDetails(submissionContext.student.id, submissionContext.submission.id)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                          >
                            <span>👁️</span>
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
