'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import Link from 'next/link';
import { container, Register } from '@/_core/shared/container';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { CreateModuleUseCase } from '@/_core/modules/content/core/use-cases/create-module/create-module.use-case';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';

type ModuleData = {
  id: string;
  title: string;
  order: number;
  lessonsCount: number;
  lessons: LessonData[];
}

type LessonData = {
  id: string;
  title: string;
  order: number;
}

type ModuleFormProps = {
  courseId: string;
}

export function ModuleForm({ courseId }: ModuleFormProps) {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);

      const moduleRepository = container.get<ModuleRepository>(
        Register.content.repository.ModuleRepository
      );

      const modulesList = await moduleRepository.listByCourse(courseId);

      const modulesData: ModuleData[] = modulesList.map(module => ({
        id: module.id,
        title: module.title,
        order: module.order,
        lessonsCount: module.lessons.length,
        lessons: []
      }));

      modulesData.sort((a, b) => a.order - b.order);

      setModules(modulesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Falha ao carregar módulos');
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const fetchLessonsForModule = useCallback(async (moduleId: string) => {
    if (isLoadingLessons[moduleId]) return;

    try {
      setIsLoadingLessons(prev => ({ ...prev, [moduleId]: true }));

      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      );

      const lessonsList = await lessonRepository.listByModule(moduleId);

      const lessonsData: LessonData[] = lessonsList.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order
      }));

      lessonsData.sort((a, b) => a.order - b.order);

      setModules(prevModules =>
        prevModules.map(module =>
          module.id === moduleId
            ? { ...module, lessons: lessonsData }
            : module
        )
      );
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoadingLessons(prev => ({ ...prev, [moduleId]: false }));
    }
  }, [isLoadingLessons]);

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      alert('O título do módulo não pode estar vazio');
      return;
    }

    setIsCreatingModule(true);

    try {
      const createModuleUseCase = container.get<CreateModuleUseCase>(
        Register.content.useCase.CreateModuleUseCase
      );

      const result = await createModuleUseCase.execute({
        courseId: courseId,
        title: newModuleTitle,
        order: modules.length
      });

      setModules([...modules, {
        id: result.module.id,
        title: result.module.title,
        order: result.module.order,
        lessonsCount: 0,
        lessons: []
      }]);

      setNewModuleTitle('');
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      alert(`Falha ao criar módulo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsCreatingModule(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <p>Carregando módulos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => fetchModules()}>Tentar Novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Always visible module creation form */}
        <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-medium mb-3">Adicionar Novo Módulo</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <InputText
                id="newModuleTitle"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Digite o título do módulo"
                required
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateModule}
              disabled={isCreatingModule}
              className="text-xs px-4 py-2"
            >
              {isCreatingModule ? 'Criando...' : 'Adicionar'}
            </Button>
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Este curso ainda não possui módulos. Adicione um módulo para começar.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {modules.map((module, index) => (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger
                  onClick={() => {
                    if (module.lessons.length === 0) {
                      fetchLessonsForModule(module.id);
                    }
                  }}
                  className="text-left"
                >
                  <div className="flex justify-between items-center w-full pr-4">
                    <span className="font-medium">
                      {index + 1}. {module.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Module actions */}
                    <div className="flex justify-end">
                      <Link href={`/admin/courses/edit/${courseId}/modules/${module.id}`}>
                        <Button className="border bg-transparent text-xs px-3 py-1 hover:bg-gray-100">
                          Editar Módulo
                        </Button>
                      </Link>
                    </div>

                    {/* Lessons list */}
                    {isLoadingLessons[module.id] ? (
                      <div className="text-center py-4 text-gray-500">
                        Carregando lições...
                      </div>
                    ) : module.lessons.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Este módulo ainda não possui lições.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lições:
                        </h4>
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex justify-between items-center p-3 border rounded-md bg-white dark:bg-gray-900"
                          >
                            <span className="text-sm">
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                            <Link href={`/admin/courses/edit/${courseId}/modules/${module.id}/lessons/${lesson.id}`}>
                              <Button className="border bg-transparent text-xs px-2 py-1 hover:bg-gray-100">
                                Editar
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
