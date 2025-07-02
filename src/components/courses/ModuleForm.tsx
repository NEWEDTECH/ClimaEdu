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
import { CreateLessonUseCase } from '@/_core/modules/content/core/use-cases/create-lesson/create-lesson.use-case';

type ModuleData = {
  id: string;
  title: string;
  order: number;
  lessonsCount: number;
  lessons: LessonData[];
  isEditing?: boolean;
  editingTitle?: string;
  isAddingLesson?: boolean;
  newLessonTitle?: string;
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
  const [isUpdatingModule, setIsUpdatingModule] = useState<Record<string, boolean>>({});
  const [isCreatingLesson, setIsCreatingLesson] = useState<Record<string, boolean>>({});
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

  const handleAddLesson = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, isAddingLesson: true, newLessonTitle: '' }
          : module
      )
    );
  };

  const handleCancelAddLesson = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, isAddingLesson: false, newLessonTitle: '' }
          : module
      )
    );
  };

  const handleCreateLesson = async (moduleId: string, lessonTitle: string) => {
    if (!lessonTitle.trim()) {
      alert('O título da lição não pode estar vazio');
      return;
    }

    setIsCreatingLesson(prev => ({ ...prev, [moduleId]: true }));

    try {
      const createLessonUseCase = container.get<CreateLessonUseCase>(
        Register.content.useCase.CreateLessonUseCase
      );

      const result = await createLessonUseCase.execute({
        moduleId: moduleId,
        title: lessonTitle
      });

      // Update the module with the new lesson
      setModules(prevModules =>
        prevModules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: [...module.lessons, {
                  id: result.lesson.id,
                  title: result.lesson.title,
                  order: result.lesson.order
                }].sort((a, b) => a.order - b.order),
                lessonsCount: module.lessonsCount + 1,
                isAddingLesson: false,
                newLessonTitle: ''
              }
            : module
        )
      );
    } catch (error) {
      console.error('Erro ao criar lição:', error);
      alert(`Falha ao criar lição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsCreatingLesson(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleEditModule = (moduleId: string, currentTitle: string) => {
    setModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, isEditing: true, editingTitle: currentTitle }
          : module
      )
    );
  };

  const handleCancelEdit = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, isEditing: false, editingTitle: '' }
          : module
      )
    );
  };

  const handleUpdateModule = async (moduleId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      alert('O título do módulo não pode estar vazio');
      return;
    }

    setIsUpdatingModule(prev => ({ ...prev, [moduleId]: true }));

    try {
      const moduleRepository = container.get<ModuleRepository>(
        Register.content.repository.ModuleRepository
      );

      const moduleData = await moduleRepository.findById(moduleId);

      if (!moduleData) {
        throw new Error('Módulo não encontrado');
      }

      moduleData.updateTitle(newTitle);

      await moduleRepository.save(moduleData);

      setModules(prevModules =>
        prevModules.map(module =>
          module.id === moduleId
            ? { ...module, title: newTitle, isEditing: false, editingTitle: '' }
            : module
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      alert(`Falha ao atualizar módulo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUpdatingModule(prev => ({ ...prev, [moduleId]: false }));
    }
  };

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
      <div className="h-full p-4 flex justify-center items-center">
        <p className="text-sm text-gray-500">Carregando módulos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Erro</h2>
        <p className="mb-4 text-sm text-center">{error}</p>
        <Button onClick={() => fetchModules()} className="text-xs">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* Header da sidebar */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Módulos do Curso
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gerencie os módulos e lições
        </p>
      </div>

      {/* Always visible module creation form */}
      <div className="mb-6 p-3 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-sm font-medium mb-3">Adicionar Novo Módulo</h3>
        <div className="space-y-2">
          <InputText
            id="newModuleTitle"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Digite o título do módulo"
            required
          />
          <Button
            type="button"
            onClick={handleCreateModule}
            disabled={isCreatingModule}
            className="w-full text-xs py-2"
          >
            {isCreatingModule ? 'Criando...' : 'Adicionar Módulo'}
          </Button>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Este curso ainda não possui módulos. Adicione um módulo para começar.
        </div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {modules.map((module, index) => (
            <AccordionItem key={module.id} value={module.id} className="border rounded-md bg-white dark:bg-gray-800 shadow-sm">
              <AccordionTrigger
                onClick={() => {
                  if (module.lessons.length === 0) {
                    fetchLessonsForModule(module.id);
                  }
                }}
                className="text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex justify-between items-center w-full pr-4">
                  <span className="font-medium text-sm">
                    {index + 1}. {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3">
                  {/* Module editing section */}
                  {module.isEditing ? (
                    <div className="p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="text-xs font-medium mb-2">Editar Módulo</h4>
                      <div className="space-y-2">
                        <InputText
                          id={`editModuleTitle-${module.id}`}
                          value={module.editingTitle || ''}
                          onChange={(e) => {
                            setModules(prevModules =>
                              prevModules.map(m =>
                                m.id === module.id
                                  ? { ...m, editingTitle: e.target.value }
                                  : m
                              )
                            );
                          }}
                          placeholder="Digite o novo título do módulo"
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleUpdateModule(module.id, module.editingTitle || '')}
                            disabled={isUpdatingModule[module.id]}
                            className="flex-1 text-xs py-1"
                          >
                            {isUpdatingModule[module.id] ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCancelEdit(module.id)}
                            disabled={isUpdatingModule[module.id]}
                            className="flex-1 border bg-transparent text-xs py-1 hover:bg-gray-100"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEditModule(module.id, module.title)}
                        className="flex-1 border bg-transparent text-xs py-1 hover:bg-gray-100"
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleAddLesson(module.id)}
                        className="flex-1 border bg-transparent text-xs py-1 hover:bg-gray-100"
                      >
                        + Lição
                      </Button>
                    </div>
                  )}

                  {/* Add lesson section */}
                  {module.isAddingLesson && (
                    <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                      <h4 className="text-xs font-medium mb-2">Adicionar Nova Lição</h4>
                      <div className="space-y-2">
                        <InputText
                          id={`newLessonTitle-${module.id}`}
                          value={module.newLessonTitle || ''}
                          onChange={(e) => {
                            setModules(prevModules =>
                              prevModules.map(m =>
                                m.id === module.id
                                  ? { ...m, newLessonTitle: e.target.value }
                                  : m
                              )
                            );
                          }}
                          placeholder="Digite o título da lição"
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleCreateLesson(module.id, module.newLessonTitle || '')}
                            disabled={isCreatingLesson[module.id]}
                            className="flex-1 text-xs py-1"
                          >
                            {isCreatingLesson[module.id] ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCancelAddLesson(module.id)}
                            disabled={isCreatingLesson[module.id]}
                            className="flex-1 border bg-transparent text-xs py-1 hover:bg-gray-100"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lessons list */}
                  {isLoadingLessons[module.id] ? (
                    <div className="text-center py-3 text-gray-500 text-xs">
                      Carregando lições...
                    </div>
                  ) : module.lessons.length === 0 ? (
                    <div className="text-center py-3 text-gray-500 text-xs">
                      Este módulo ainda não possui lições.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lições:
                      </h4>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <Link 
                          key={lesson.id}
                          href={`/admin/courses/edit/${courseId}/${module.id}/lessons/${lesson.id}`}
                          className="block"
                        >
                          <div className="flex justify-between items-center p-2 border rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                            <span className="text-xs flex-1">
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                            <svg 
                              className="w-3 h-3 text-gray-400" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
