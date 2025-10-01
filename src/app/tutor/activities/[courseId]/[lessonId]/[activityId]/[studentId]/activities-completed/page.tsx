"use client";

import React, { useState, useEffect, use } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Button } from '@/components/button';
import { useProfile } from '@/context/zustand/useProfile';
import { ActivityFileUpload } from '@/components/courses/student/ActivityFileUpload';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
import { ActivitySubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/ActivitySubmissionRepository';
import { ApproveRejectActivitySubmissionUseCase } from '@/_core/modules/content/core/use-cases/approve-reject-activity-submission';
import type { Course } from '@/_core/modules/content/core/entities/Course';
import type { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import type { User } from '@/_core/modules/user/core/entities/User';
import type { Activity } from '@/_core/modules/content/core/entities/Activity';
import type { ActivitySubmission } from '@/_core/modules/content/core/entities/ActivitySubmission';
import { ActivitySubmissionStatus } from '@/_core/modules/content/core/entities/ActivitySubmissionStatus';

export default function StudentActivitiesCompletedPage({ params }: { params: Promise<{ courseId: string, lessonId: string, activityId: string, studentId: string }> }) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const { courseId, lessonId, activityId, studentId } = resolvedParams;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  
  const { infoUser } = useProfile();
  const institutionId = infoUser.currentIdInstitution;
  const tutorId = infoUser.id;

  // Buscar dados do curso, lição, aluno e submissões
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !lessonId || !studentId || !activityId) return;

      try {
        setLoading(true);

        // Buscar curso
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        const courseData = await courseRepository.findById(courseId);
        setCourse(courseData);

        // Buscar lição
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        );
        const lessonData = await lessonRepository.findById(lessonId);
        setLesson(lessonData);

        // Buscar aluno
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        );
        const studentData = await userRepository.findById(studentId);
        setStudent(studentData);

        // Buscar atividades da lição
        const activityRepository = container.get<ActivityRepository>(
          Register.content.repository.ActivityRepository
        );
        const activitiesData = await activityRepository.findByLessonId(lessonId);
        setActivities(activitiesData ? [activitiesData] : []);

        // Buscar submissões da atividade para este aluno
        const submissionRepository = container.get<ActivitySubmissionRepository>(
          Register.content.repository.ActivitySubmissionRepository
        );
        const submissionsData = await submissionRepository.findByActivityAndStudent(activityId, studentId);
        setSubmissions(submissionsData);

        // Pre-preencher feedback se já houver uma submissão avaliada
        if (submissionsData.length > 0 && submissionsData[0].feedback) {
          setFeedback(submissionsData[0].feedback);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, studentId, activityId]);

  const handleApprove = async () => {
    if (!submissions.length) {
      alert('Nenhuma submissão encontrada para aprovar.');
      return;
    }

    const submission = submissions[0];
    
    if (submission.status !== ActivitySubmissionStatus.PENDING) {
      alert('Esta submissão já foi avaliada.');
      return;
    }

    setProcessing(true);
    try {
      const useCase = container.get<ApproveRejectActivitySubmissionUseCase>(
        Register.content.useCase.ApproveRejectActivitySubmissionUseCase
      );

      const result = await useCase.execute({
        submissionId: submission.id,
        action: 'approve',
        tutorId,
        feedback: feedback || undefined
      });

      alert('✅ ' + result.message);
      
      // Atualizar a lista de submissões
      const submissionRepository = container.get<ActivitySubmissionRepository>(
        Register.content.repository.ActivitySubmissionRepository
      );
      const updatedSubmissions = await submissionRepository.findByActivityAndStudent(activityId, studentId);
      setSubmissions(updatedSubmissions);

    } catch (error: any) {
      alert('❌ Erro ao aprovar: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!submissions.length) {
      alert('Nenhuma submissão encontrada para reprovar.');
      return;
    }

    const submission = submissions[0];
    
    if (submission.status !== ActivitySubmissionStatus.PENDING) {
      alert('Esta submissão já foi avaliada.');
      return;
    }

    if (!feedback.trim()) {
      alert('⚠️ Feedback é obrigatório ao reprovar uma atividade.');
      return;
    }

    setProcessing(true);
    try {
      const useCase = container.get<ApproveRejectActivitySubmissionUseCase>(
        Register.content.useCase.ApproveRejectActivitySubmissionUseCase
      );

      const result = await useCase.execute({
        submissionId: submission.id,
        action: 'reject',
        tutorId,
        feedback
      });

      alert('✅ ' + result.message);
      
      // Atualizar a lista de submissões
      const submissionRepository = container.get<ActivitySubmissionRepository>(
        Register.content.repository.ActivitySubmissionRepository
      );
      const updatedSubmissions = await submissionRepository.findByActivityAndStudent(activityId, studentId);
      setSubmissions(updatedSubmissions);

    } catch (error: any) {
      alert('❌ Erro ao reprovar: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToStudents = () => {
    window.location.href = '/tutor/student-activities';
  };

  const currentSubmission = submissions.length > 0 ? submissions[0] : null;
  const isPending = currentSubmission?.status === ActivitySubmissionStatus.PENDING;
  const isApproved = currentSubmission?.status === ActivitySubmissionStatus.APPROVED;
  const isRejected = currentSubmission?.status === ActivitySubmissionStatus.REJECTED;

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="primary" 
              onClick={handleBackToStudents}
              className="mb-4"
            >
              ← Voltar para Atividades dos Alunos
            </Button>
            <h1 className="text-2xl font-bold mb-2">Atividades do Aluno</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {loading ? (
                'Carregando informações...'
              ) : (
                <>
                  Curso: {course?.title || courseId} | Lição: {lesson?.title || lessonId} | Aluno: {student?.name || studentId}
                </>
              )}
            </p>
          </div>

          {/* Status da Submissão */}
          {!loading && currentSubmission && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              isPending ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
              isApproved ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' :
              isRejected ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
              'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Status da Atividade: {' '}
                    <span className={
                      isPending ? 'text-yellow-700 dark:text-yellow-400' :
                      isApproved ? 'text-green-700 dark:text-green-400' :
                      isRejected ? 'text-red-700 dark:text-red-400' :
                      'text-gray-700'
                    }>
                      {isPending ? '⏳ Pendente de Avaliação' :
                       isApproved ? '✅ Aprovada' :
                       isRejected ? '❌ Reprovada' : 'Desconhecido'}
                    </span>
                  </h3>
                  {currentSubmission.reviewedBy && currentSubmission.reviewedAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avaliada em {new Date(currentSubmission.reviewedAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                  {currentSubmission.feedback && (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded">
                      <p className="text-sm font-medium mb-1">Feedback do Tutor:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{currentSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Renderizar atividades encontradas na lição */}
          {!loading && activities.length > 0 ? (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">{activity.description}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.instructions}</p>
                    
                    <ActivityFileUpload
                      activityId={activityId}
                      studentId={studentId}
                      institutionId={institutionId}
                    />

                    {/* Painel de Avaliação */}
                    {currentSubmission && isPending && (
                      <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold mb-4">Avaliar Atividade</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">
                            Feedback para o aluno
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Adicione um feedback sobre a atividade do aluno..."
                            disabled={processing}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            * Obrigatório ao reprovar a atividade
                          </p>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={handleApprove}
                            disabled={processing}
                            variant="primary"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processing ? '⏳ Processando...' : '✅ Aprovar Atividade'}
                          </Button>

                          <Button
                            onClick={handleReject}
                            disabled={processing}
                            variant="secondary"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {processing ? '⏳ Processando...' : '❌ Reprovar Atividade'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Mensagem quando já foi avaliado */}
                    {currentSubmission && !isPending && (
                      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-gray-700 dark:text-gray-300">
                          Esta atividade já foi avaliada e não pode ser modificada.
                        </p>
                      </div>
                    )}

                    {/* Mensagem quando não há submissão */}
                    {!currentSubmission && !loading && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-700">
                        <p className="text-blue-700 dark:text-blue-300">
                          ℹ️ O aluno ainda não enviou esta atividade.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && activities.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Esta lição não possui atividades cadastradas.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Carregando atividades...
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Buscando atividades da lição.
              </p>
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
