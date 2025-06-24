"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Progress } from '@/components/ui/helpers/progress';
import { Button } from '@/components/ui/button/button';

const mockCourses = [
  {
    id: '1',
    title: 'Introdução à Programação',
    description: 'Aprenda os fundamentos da programação com JavaScript',
    progress: 75,
    modules: [
      {
        id: 'm1',
        title: 'Variáveis e Tipos de Dados',
        lessons: [
          { id: 'l1', title: 'O que são variáveis', completed: true },
          { id: 'l2', title: 'Tipos primitivos', completed: true },
          { id: 'l3', title: 'Operadores', completed: false },
        ]
      },
      {
        id: 'm2',
        title: 'Estruturas de Controle',
        lessons: [
          { id: 'l4', title: 'Condicionais', completed: true },
          { id: 'l5', title: 'Loops', completed: false },
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Desenvolvimento Web',
    description: 'Crie sites responsivos com HTML, CSS e JavaScript',
    progress: 30,
    modules: [
      {
        id: 'm3',
        title: 'HTML Básico',
        lessons: [
          { id: 'l6', title: 'Estrutura HTML', completed: true },
          { id: 'l7', title: 'Tags semânticas', completed: false },
        ]
      }
    ]
  }
];

export default function ConteudosPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedModule(null);
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
  };

  const renderCourseList = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Conteúdos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acesse os cursos e materiais disponíveis para você
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {course.description}
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
              </div>
              <Button 
                onClick={() => handleCourseSelect(course.id)}
                className="w-full"
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );

  const renderModuleList = () => {
    const course = mockCourses.find(c => c.id === selectedCourse);
    if (!course) return null;

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToCourses}
            className="mb-4"
          >
            ← Voltar para cursos
          </Button>
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione um módulo para continuar seus estudos
          </p>
        </div>

        <div className="space-y-4">
          {course.modules.map((module) => (
            <Card 
              key={module.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleModuleSelect(module.id)}
            >
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {module.lessons.length} aulas
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>
                      {Math.round(
                        (module.lessons.filter(l => l.completed).length / module.lessons.length) * 100
                      )}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.round(
                      (module.lessons.filter(l => l.completed).length / module.lessons.length) * 100
                    )} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  const renderLessonList = () => {
    const course = mockCourses.find(c => c.id === selectedCourse);
    if (!course) return null;

    const moduleData = course.modules.find(m => m.id === selectedModule);
    if (!moduleData) return null;

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToModules}
            className="mb-4"
          >
            ← Voltar para módulos
          </Button>
          <h1 className="text-2xl font-bold mb-1">{course.title}</h1>
          <h2 className="text-xl font-semibold mb-2">{moduleData.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma aula para começar
          </p>
        </div>

        <div className="space-y-4">
          {moduleData.lessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className={`hover:shadow-md transition-shadow ${
                lesson.completed ? 'border-green-500 dark:border-green-700' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  {lesson.completed && (
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
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button>
                  {lesson.completed ? 'Revisar' : 'Iniciar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {!selectedCourse && renderCourseList()}
          {selectedCourse && !selectedModule && renderModuleList()}
          {selectedCourse && selectedModule && renderLessonList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
