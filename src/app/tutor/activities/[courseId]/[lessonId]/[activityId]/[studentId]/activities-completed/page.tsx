"use client";

import React, { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
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
import type { Course } from '@/_core/modules/content/core/entities/Course';
import type { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import type { User } from '@/_core/modules/user/core/entities/User';
import type { Activity } from '@/_core/modules/content/core/entities/Activity';

export default function StudentActivitiesCompletedPage({ params }: { params: Promise<{ courseId: string, lessonId: string, activityId: string, studentId: string }> }) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const { courseId, lessonId, activityId, studentId } = resolvedParams;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { infoUser } = useProfile();
  const institutionId = infoUser.currentIdInstitution;

  // Buscar dados do curso, lição e aluno
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !lessonId || !studentId) return;

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
        console.log(activitiesData, 'kjdklawjldkajwld')
        setActivities(activitiesData ? [activitiesData] : []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, studentId]);

  const handleBackToStudents = () => {
    window.location.href = '/tutor/student-activities';
  };

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

          {/* Renderizar atividades encontradas na lição */}
          {!loading && activities.length > 0 ? (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <ActivityFileUpload
                      activityId={activityId}
                      studentId={studentId}
                      institutionId={institutionId}
                    />
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
