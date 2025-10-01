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
import { ListTutorCoursesWithStudentsUseCase } from '@/_core/modules/content/core/use-cases/list-tutor-courses-with-students/list-tutor-courses-with-students.use-case';
import type { CourseWithStudents } from '@/_core/modules/content/core/use-cases/list-tutor-courses-with-students/list-tutor-courses-with-students.output';
import type { Course } from '@/_core/modules/content/core/entities/Course';
import type { User } from '@/_core/modules/user/core/entities/User';

interface TableRow {
  course: Course;
  student: User | null;
  courseId: string;
}

export default function StudentActivitiesPage() {
  const [coursesWithStudents, setCoursesWithStudents] = useState<CourseWithStudents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('');
  
  const { infoUser } = useProfile();
  const tutorId = infoUser.id;
  const institutionId = infoUser.currentIdInstitution;

  const fetchCoursesWithStudents = useCallback(async () => {
    if (!tutorId || !institutionId) {
      setError('Informações do tutor não encontradas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const useCase = container.get<ListTutorCoursesWithStudentsUseCase>(
        Register.content.useCase.ListTutorCoursesWithStudentsUseCase
      );

      const result = await useCase.execute({
        tutorId,
        institutionId
      });

      setCoursesWithStudents(result.coursesWithStudents);
    } catch (err) {
      console.error('Error fetching courses with students:', err);
      setError('Falha ao carregar cursos e alunos. Tente novamente.');
      showToast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [tutorId, institutionId]);

  useEffect(() => {
    fetchCoursesWithStudents();
  }, [fetchCoursesWithStudents]);

  // Criar uma lista plana de curso-aluno para a tabela
  const courseStudentRows: TableRow[] = [];
  
  coursesWithStudents.forEach(courseWithStudents => {
    if (courseWithStudents.students.length > 0) {
      courseWithStudents.students.forEach(student => {
        courseStudentRows.push({
          course: courseWithStudents.course,
          student: student,
          courseId: courseWithStudents.course.id
        });
      });
    } else {
      courseStudentRows.push({
        course: courseWithStudents.course,
        student: null,
        courseId: courseWithStudents.course.id
      });
    }
  });

  // Aplicar filtros
  const filteredRows = courseStudentRows.filter((row: TableRow) => {
    const courseMatch = courseFilter === '' || 
      row.course.title.toLowerCase().includes(courseFilter.toLowerCase());
    
    const studentMatch = studentFilter === '' || 
      (row.student && row.student.name.toLowerCase().includes(studentFilter.toLowerCase()));
    
    return courseMatch && studentMatch;
  });

  const handleViewQuestionnaires = (studentId: string | null) => {
    if (studentId) {
      // Navegar para página de questionários do estudante específico
      window.location.href = `/tutor/questionnaire/${studentId}/questionnaire-completed`;
    } else {
      // Navegar para página geral de questionários
      window.location.href = `/tutor/questionnaire/questionnaire-completed`;
    }
  };

  const handleViewActivities = (studentId: string | null) => {
    if (studentId) {
      // Navegar para página de atividades completadas do estudante específico
      window.location.href = `/tutor/activities/${studentId}/activities-completed`;
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
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
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
              <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Filtrar por Aluno
              </label>
              <InputText
                id="student-filter"
                placeholder="Digite o nome do aluno..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}


          {/* Tabela de Cursos e Alunos */}
          <div className="bg-white dark:bg-black/10 rounded-lg shadow-sm border overflow-hidden">
            <div className={`overflow-x-auto ${filteredRows.length > 8 ? 'max-h-96 overflow-y-auto' : ''}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-black/10">
                  <tr className="dark:text-white dark:bg-black/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Estudante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black/10 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto text-white text-xl mb-4">
                          📚
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {coursesWithStudents.length === 0 ? 'Nenhum curso encontrado' : 'Nenhum resultado encontrado'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                          {coursesWithStudents.length === 0 
                            ? 'Você ainda não é tutor de nenhum curso.' 
                            : 'Tente ajustar os filtros de busca.'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => (
                      <tr key={`${row.courseId}-${row.student?.id || 'no-student'}-${index}`} className="hover:bg-gray-50 dark:hover:bg-black/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                              📚
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {row.course.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                {row.course.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.student ? (
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                👤
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {row.student.name}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-300 italic">
                              Nenhum aluno matriculado
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              onClick={() => handleViewQuestionnaires(row.student?.id || null)}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                            >
                              <span>📋</span>
                              Questionários
                            </Button>
                            
                            {row.student && (
                              <Button
                                onClick={() => handleViewActivities(row.student?.id || null)}
                                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
                              >
                                <span>📝</span>
                                Atividades
                              </Button>
                            )}
                            
                          </div>
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
