"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress';

const mockStudents = [
  {
    id: 's1',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    enrolledCourses: [
      {
        id: 'c1',
        title: 'Introdução à Programação',
        progress: 75,
        lastActivity: '2025-04-10T14:30:00',
        completedLessons: 9,
        totalLessons: 12,
        grade: 85
      },
      {
        id: 'c2',
        title: 'Desenvolvimento Web Básico',
        progress: 30,
        lastActivity: '2025-04-09T10:15:00',
        completedLessons: 3,
        totalLessons: 10,
        grade: 78
      }
    ]
  },
  {
    id: 's2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    enrolledCourses: [
      {
        id: 'c1',
        title: 'Introdução à Programação',
        progress: 100,
        lastActivity: '2025-04-08T16:45:00',
        completedLessons: 12,
        totalLessons: 12,
        grade: 92
      }
    ]
  },
  {
    id: 's3',
    name: 'Pedro Santos',
    email: 'pedro.santos@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    enrolledCourses: [
      {
        id: 'c2',
        title: 'Desenvolvimento Web Básico',
        progress: 60,
        lastActivity: '2025-04-11T09:20:00',
        completedLessons: 6,
        totalLessons: 10,
        grade: 81
      }
    ]
  },
  {
    id: 's4',
    name: 'Ana Costa',
    email: 'ana.costa@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    enrolledCourses: [
      {
        id: 'c1',
        title: 'Introdução à Programação',
        progress: 50,
        lastActivity: '2025-04-07T11:30:00',
        completedLessons: 6,
        totalLessons: 12,
        grade: 75
      },
      {
        id: 'c2',
        title: 'Desenvolvimento Web Básico',
        progress: 20,
        lastActivity: '2025-04-06T14:10:00',
        completedLessons: 2,
        totalLessons: 10,
        grade: 70
      }
    ]
  }
];

const mockActivities = [
  {
    id: 'a1',
    studentId: 's1',
    studentName: 'João Silva',
    courseId: 'c1',
    courseTitle: 'Introdução à Programação',
    type: 'lesson_completion',
    title: 'Concluiu a lição: Algoritmos de Ordenação',
    timestamp: '2025-04-10T14:30:00'
  },
  {
    id: 'a2',
    studentId: 's3',
    studentName: 'Pedro Santos',
    courseId: 'c2',
    courseTitle: 'Desenvolvimento Web Básico',
    type: 'questionnaire_submission',
    title: 'Enviou o questionário: HTML e CSS Básico',
    timestamp: '2025-04-11T09:20:00',
    score: 85
  },
  {
    id: 'a3',
    studentId: 's2',
    studentName: 'Maria Oliveira',
    courseId: 'c1',
    courseTitle: 'Introdução à Programação',
    type: 'certificate_earned',
    title: 'Obteve certificado do curso',
    timestamp: '2025-04-08T16:45:00'
  },
  {
    id: 'a4',
    studentId: 's4',
    studentName: 'Ana Costa',
    courseId: 'c1',
    courseTitle: 'Introdução à Programação',
    type: 'discussion_post',
    title: 'Postou no fórum: Dúvida sobre algoritmos de ordenação',
    timestamp: '2025-04-07T11:30:00'
  },
  {
    id: 'a5',
    studentId: 's1',
    studentName: 'João Silva',
    courseId: 'c2',
    courseTitle: 'Desenvolvimento Web Básico',
    type: 'activity_submission',
    title: 'Enviou a atividade: Criação de Layout Responsivo',
    timestamp: '2025-04-09T10:15:00'
  }
];

export default function AcompanhamentoPage() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<string | null>(null);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    setSelectedCourse(null);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleBackToStudentList = () => {
    setSelectedStudent(null);
    setSelectedCourse(null);
  };

  const handleBackToStudentDetail = () => {
    setSelectedCourse(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (courseId: string | null) => {
    setFilterCourse(courseId);
  };


  const uniqueCourses = Array.from(
    new Set(
      mockStudents.flatMap(student => 
        student.enrolledCourses.map(course => course.title)
      )
    )
  );


  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === null || 
                         student.enrolledCourses.some(course => course.title === filterCourse);
    
    return matchesSearch && matchesCourse;
  });


  const getStudentActivities = (studentId: string) => {
    return mockActivities
      .filter(activity => activity.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };


  const getCourseActivities = (studentId: string, courseId: string) => {
    return mockActivities
      .filter(activity => activity.studentId === studentId && activity.courseId === courseId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const renderStudentList = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Acompanhamento Individual</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Monitore o progresso e desempenho dos seus alunos
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar aluno por nome ou email..."
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              value={filterCourse || ''}
              onChange={(e) => handleFilterChange(e.target.value === '' ? null : e.target.value)}
            >
              <option value="">Todos os cursos</option>
              {uniqueCourses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className="hover:shadow-md transition-shadow"
              onClick={() => handleStudentSelect(student.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <img 
                    src={student.avatarUrl} 
                    alt={student.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div>{student.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      {student.email}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.enrolledCourses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{course.title}</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Última atividade: {new Date(course.lastActivity).toLocaleDateString('pt-BR')}</span>
                        <span>Nota: {course.grade}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStudentSelect(student.id);
                  }}
                >
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <svg 
              className="w-16 h-16 text-gray-400 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        )}
      </div>
    </>
  );

  const renderStudentDetail = () => {
    const student = mockStudents.find(s => s.id === selectedStudent);
    if (!student) return null;

    const activities = getStudentActivities(student.id);

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToStudentList}
            className="mb-4"
          >
            ← Voltar para lista de alunos
          </Button>
          <div className="flex items-center mb-4">
            <img 
              src={student.avatarUrl} 
              alt={student.name} 
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cursos Matriculados</p>
                  <p className="text-3xl font-bold">{student.enrolledCourses.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-blue-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Médio</p>
                  <p className="text-3xl font-bold">
                    {Math.round(
                      student.enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / 
                      student.enrolledCourses.length
                    )}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nota Média</p>
                  <p className="text-3xl font-bold">
                    {Math.round(
                      student.enrolledCourses.reduce((acc, course) => acc + course.grade, 0) / 
                      student.enrolledCourses.length
                    )}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-yellow-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Matriculados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.enrolledCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleCourseSelect(course.id)}
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{course.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        course.progress === 100 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}>
                        {course.progress === 100 ? 'Concluído' : 'Em andamento'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Lições: {course.completedLessons}/{course.totalLessons}</span>
                      <span>Nota: {course.grade}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        activity.type === 'lesson_completion' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' 
                          : activity.type === 'questionnaire_submission' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                          : activity.type === 'certificate_earned'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
                          : activity.type === 'discussion_post'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                      }`}>
                        {activity.type === 'lesson_completion' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {activity.type === 'questionnaire_submission' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                        {activity.type === 'certificate_earned' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )}
                        {activity.type === 'discussion_post' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        )}
                        {activity.type === 'activity_submission' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{activity.courseTitle}</span>
                          <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                        {activity.type === 'questionnaire_submission' && activity.score !== undefined && (
                          <p className="text-xs mt-1">
                            Nota: <span className="font-medium">{activity.score}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Nenhuma atividade recente registrada.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button>
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                Enviar Mensagem
              </Button>
              <Button variant="ghost">
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Gerar Relatório
              </Button>
              <Button variant="secondary">
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                Agendar Tutoria
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderCourseDetail = () => {
    const student = mockStudents.find(s => s.id === selectedStudent);
    if (!student) return null;

    const course = student.enrolledCourses.find(c => c.id === selectedCourse);
    if (!course) return null;

    const activities = getCourseActivities(student.id, course.id);

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToStudentDetail}
            className="mb-4"
          >
            ← Voltar para detalhes do aluno
          </Button>
          <div className="flex items-center mb-4">
            <img 
              src={student.avatarUrl} 
              alt={student.name} 
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{course.title}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Progresso</p>
                  <p className="text-3xl font-bold">{course.progress}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-blue-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lições Concluídas</p>
                  <p className="text-3xl font-bold">{course.completedLessons}/{course.totalLessons}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nota</p>
                  <p className="text-3xl font-bold">{course.grade}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-yellow-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Atividades no Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      activity.type === 'lesson_completion' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' 
                        : activity.type === 'questionnaire_submission' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                        : activity.type === 'certificate_earned'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
                        : activity.type === 'discussion_post'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                    }`}>
                      {activity.type === 'lesson_completion' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {activity.type === 'questionnaire_submission' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {activity.type === 'certificate_earned' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {activity.type === 'discussion_post' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      )}
                      {activity.type === 'activity_submission' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      {activity.type === 'questionnaire_submission' && activity.score !== undefined && (
                        <p className="text-xs mt-1">
                          Nota: <span className="font-medium">{activity.score}%</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Nenhuma atividade registrada para este curso.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
                placeholder="Escreva um feedback para o aluno sobre seu desempenho neste curso..."
              />
              <Button className="mt-4">
                Enviar Feedback
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                  Agendar Videoconferência
                </Button>
                <Button variant="ghost" className="w-full">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Gerar Relatório Detalhado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {!selectedStudent && renderStudentList()}
          {selectedStudent && !selectedCourse && renderStudentDetail()}
          {selectedStudent && selectedCourse && renderCourseDetail()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
