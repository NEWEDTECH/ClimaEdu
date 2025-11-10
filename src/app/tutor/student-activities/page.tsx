'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { Button } from '@/components/button';
import { SelectComponent } from '@/components/select';
import { LoadingSpinner } from '@/components/loader';
import { showToast } from '@/components/toast';
import { useProfile } from '@/context/zustand/useProfile';
import { ListTutorCoursesUseCase } from '@/_core/modules/content/core/use-cases/list-tutor-courses/list-tutor-courses.use-case';
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import type { Course } from '@/_core/modules/content/core/entities/Course';
import type { User } from '@/_core/modules/user/core/entities/User';
import type { Enrollment } from '@/_core/modules/enrollment/core/entities/Enrollment';
import type { Module } from '@/_core/modules/content/core/entities/Module';
import type { Lesson } from '@/_core/modules/content/core/entities/Lesson';

interface TableRow {
  courseModule: Module;
  lesson: Lesson;
  course: Course;
  selectedStudent: User | null;
}

export default function StudentActivitiesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  // Buscar cursos do tutor
  const fetchTutorCourses = useCallback(async () => {
    if (!tutorId || !institutionId) {
      setError('Informações do tutor não encontradas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const useCase = container.get<ListTutorCoursesUseCase>(
        Register.content.useCase.ListTutorCoursesUseCase
      );

      const result = await useCase.execute({
        tutorId,
        institutionId
      });

      setCourses(result.courses);
    } catch (err) {
      console.error('Error fetching tutor courses:', err);
      setError('Falha ao carregar cursos. Tente novamente.');
      showToast.error('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  }, [tutorId, institutionId]);

  // Buscar alunos do curso selecionado
  const fetchCourseStudents = useCallback(async (courseId: string) => {
    if (!courseId) {
      setStudents([]);
      return;
    }

    try {
      // Buscar enrollments do curso
      const enrollmentUseCase = container.get<ListEnrollmentsUseCase>(
        Register.enrollment.useCase.ListEnrollmentsUseCase
      );

      const enrollmentResult = await enrollmentUseCase.execute({
        courseId
      });

      // Buscar dados dos usuários
      const userRepository = container.get<UserRepository>(
        Register.user.repository.UserRepository
      );

      const studentsData = await Promise.all(
        enrollmentResult.enrollments.map(async (enrollment: Enrollment) => {
          const user = await userRepository.findById(enrollment.userId);
          return user;
        })
      );

      const validStudents = studentsData.filter((student): student is User => student !== null);
      setStudents(validStudents);
    } catch (err) {
      console.error('Error fetching course students:', err);
      showToast.error('Erro ao carregar alunos do curso');
      setStudents([]);
    }
  }, []);

  // Buscar módulos e lições do curso selecionado
  const fetchCourseModulesAndLessons = useCallback(async (courseId: string) => {
    if (!courseId) {
      setModules([]);
      setLessons([]);
      return;
    }

    try {
      // Buscar módulos do curso
      const moduleRepository = container.get<ModuleRepository>(
        Register.content.repository.ModuleRepository
      );

      const courseModules = await moduleRepository.listByCourse(courseId);
      setModules(courseModules);

      // Buscar lições de todos os módulos
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      );

      const allLessons: Lesson[] = [];
      for (const courseModule of courseModules) {
        const moduleLessons = await lessonRepository.listByModule(courseModule.id);
        allLessons.push(...moduleLessons);
      }

      setLessons(allLessons);
    } catch (err) {
      console.error('Error fetching course modules and lessons:', err);
      showToast.error('Erro ao carregar módulos e lições');
      setModules([]);
      setLessons([]);
    }
  }, []);

  useEffect(() => {
    fetchTutorCourses();
  }, [fetchTutorCourses]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseStudents(selectedCourseId);
      fetchCourseModulesAndLessons(selectedCourseId);
      setSelectedStudentId(''); // Reset student selection
    } else {
      setStudents([]);
      setModules([]);
      setLessons([]);
      setSelectedStudentId('');
    }
  }, [selectedCourseId, fetchCourseStudents, fetchCourseModulesAndLessons]);

  // Preparar opções para os selects
  const courseOptions = [
    { value: '', label: 'Selecione um curso' },
    ...courses.map(course => ({
      value: course.id,
      label: course.title
    }))
  ];

  const studentOptions = [
    { value: '', label: 'Todos os alunos' },
    ...students.map(student => ({
      value: student.id,
      label: student.name
    }))
  ];

  // Preparar dados para a tabela - uma linha para cada lição
  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;
  const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;

  const tableRows: TableRow[] = lessons.map(lesson => {
    const lessonModule = modules.find(m => m.id === lesson.moduleId);
    return {
      courseModule: lessonModule!,
      lesson,
      course: selectedCourse!,
      selectedStudent: selectedStudent || null
    };
  });

  const handleViewQuestionnaires = (courseId: string, lessonId: string, studentId: string | null) => {
    if (studentId) {
      // Navegar para página de questionários do estudante específico no curso
      window.location.href = `/tutor/questionnaire/${courseId}/${lessonId}/${studentId}/questionnaire-completed`;
    } else {
      // Navegar para página geral de questionários
      window.location.href = `/tutor/questionnaire/questionnaire-completed`;
    }
  };

  const handleViewActivities = (courseId: string, lessonId: string, activityId: string | undefined, studentId: string | null) => {
    
    if (studentId && activityId) {
      // Navegar para página de atividades completadas do estudante específico
      window.location.href = `/tutor/activities/${courseId}/${lessonId}/${activityId}/${studentId}/activities-completed`;
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

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Atividades dos Alunos</h1>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Filtrar por Curso
              </label>
              <SelectComponent
                value={selectedCourseId}
                onChange={(value) => setSelectedCourseId(value)}
                options={courseOptions}
                placeholder="Selecione um curso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Filtrar por Aluno
              </label>
              <SelectComponent
                value={selectedStudentId}
                onChange={(value) => setSelectedStudentId(value)}
                options={studentOptions}
                placeholder="Selecione um aluno"
                disabled={!selectedCourseId}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Tabela de Alunos */}
          {selectedCourseId && (
            <div className="bg-white dark:bg-black/10 rounded-lg shadow-sm border overflow-hidden">
              <div className={`overflow-x-auto ${tableRows.length > 8 ? 'max-h-96 overflow-y-auto' : ''}`}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-black/10">
                    <tr className="dark:text-white dark:bg-black/10">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Módulos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Lições
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-black/10 divide-y divide-gray-200 dark:divide-gray-700">
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
                            📚
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Nenhum conteúdo encontrado
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                            Este curso ainda não possui módulos ou lições.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tableRows.map((row: TableRow, index: number) => (
                        <tr key={`${selectedCourseId}-${row.lesson.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-black/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                📁
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {row.courseModule.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                📄
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {row.lesson.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => handleViewQuestionnaires(selectedCourseId, row.lesson.id, row.selectedStudent?.id  || null)}
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                              >
                                <span>📋</span>
                                Questionários
                              </Button>
                              
                              <Button
                                onClick={() => handleViewActivities(selectedCourseId, row.lesson.id, row.lesson.activity?.id, row.selectedStudent?.id  || null)}
                                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
                              >
                                <span>📝</span>
                                Atividades
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensagem quando nenhum curso está selecionado */}
          {!selectedCourseId && (
            <div className="bg-white dark:bg-black/10 rounded-lg shadow-sm border p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione um curso
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Escolha um curso no filtro acima para visualizar os alunos e suas atividades.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
