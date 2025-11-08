'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import Link from 'next/link';
import { container, Register } from '@/_core/shared/container';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { CreateModuleUseCase } from '@/_core/modules/content/core/use-cases/create-module/create-module.use-case';
import { CreateLessonUseCase } from '@/_core/modules/content/core/use-cases/create-lesson/create-lesson.use-case';
import { DeleteModuleUseCase, DeleteModuleInput } from '@/_core/modules/content/core/use-cases/delete-module';
import { ReorderModal } from './ReorderModal';

type ModuleData = {
  id: string;
  title: string;
  order: number;
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
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmModuleId, setDeleteConfirmModuleId] = useState<string | null>(null);
  const [isDeletingModule, setIsDeletingModule] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

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

  const handleDeleteModule = async (moduleId: string) => {
    setIsDeletingModule(true);

    try {
      const deleteModuleUseCase = container.get<DeleteModuleUseCase>(
        Register.content.useCase.DeleteModuleUseCase
      );

      await deleteModuleUseCase.execute(new DeleteModuleInput(moduleId));

      setModules(prevModules => prevModules.filter(m => m.id !== moduleId));
      setDeleteConfirmModuleId(null);
      
      alert('Módulo e suas lições excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      alert(`Falha ao excluir módulo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeletingModule(false);
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header da sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Módulos do Curso</h2>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Always visible module creation form */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-green-100 dark:border-gray-600 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Adicionar Novo Módulo</h3>
          </div>
          <div className="space-y-3">
            <InputText
              id="newModuleTitle"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="Digite o título do módulo"
              required
              className="bg-white dark:bg-gray-800 border-green-200 dark:border-gray-600"
            />
            <Button
              type="button"
              onClick={handleCreateModule}
              disabled={isCreatingModule}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg shadow-sm transition-all duration-200"
            >
              {isCreatingModule ? 'Criando...' : 'Adicionar Módulo'}
            </Button>
          </div>
        </div>

        {/* Reorder Button */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-purple-100 dark:border-gray-600 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Reorganizar Conteúdo</h3>
          </div>
          <Button
            type="button"
            onClick={() => setIsReorderModalOpen(true)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 rounded-lg shadow-sm transition-all duration-200"
          >
            Reordenar
          </Button>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>Este curso ainda não possui módulos.</p>
            <p className="text-xs mt-1">Adicione um módulo para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Module Header */}
                <Button
                  onClick={() => {
                    const isOpen = openModules.has(module.id);
                    const newOpenModules = new Set(openModules);
                    
                    if (isOpen) {
                      newOpenModules.delete(module.id);
                    } else {
                      newOpenModules.add(module.id);
                      // Fetch lessons if not already loaded
                      if (module.lessons.length === 0) {
                        fetchLessonsForModule(module.id);
                      }
                    }
                    
                    setOpenModules(newOpenModules);
                  }}
                  variant="ghost"
                  className="flex items-center w-full h-auto p-4 text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 rounded-none shadow-none border-0 justify-start"
                  icon={
                    <svg
                      className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${
                        openModules.has(module.id) ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  }
                  iconPosition="end"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {index + 1}. {module.title}
                    </span>
                  </div>
                </Button>

                {/* Module Content */}
                {openModules.has(module.id) && (
                  <div className="p-4 space-y-3 border-t border-gray-100 dark:border-gray-700">
                  {/* Module editing section */}
                  {module.isEditing ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="text-xs font-medium mb-2 text-blue-800 dark:text-blue-200">Editar Módulo</h4>
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
                          className="bg-white dark:bg-gray-800"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleUpdateModule(module.id, module.editingTitle || '')}
                            disabled={isUpdatingModule[module.id]}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg"
                          >
                            {isUpdatingModule[module.id] ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCancelEdit(module.id)}
                            disabled={isUpdatingModule[module.id]}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-2 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setDeleteConfirmModuleId(module.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
                        >
                          Excluir Módulo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEditModule(module.id, module.title)}
                        variant='secondary'
                      >
                        Editar Módulo
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleAddLesson(module.id)}
                        variant='primary'
                      >
                        + Lição
                      </Button>
                    </div>
                  )}

                  {/* Add lesson section */}
                  {module.isAddingLesson && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="text-xs font-medium mb-2 text-green-800 dark:text-green-200">Adicionar Nova Lição</h4>
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
                          className="bg-white dark:bg-gray-800"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleCreateLesson(module.id, module.newLessonTitle || '')}
                            disabled={isCreatingLesson[module.id]}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg"
                          >
                            {isCreatingLesson[module.id] ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleCancelAddLesson(module.id)}
                            disabled={isCreatingLesson[module.id]}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-2 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lessons list */}
                  {isLoadingLessons[module.id] ? (
                    <div className="flex flex-col justify-center items-center py-4 space-y-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Carregando lições...</p>
                    </div>
                  ) : module.lessons.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-xs bg-gray-50 dark:bg-gray-700 rounded-lg">
                      Este módulo ainda não possui lições.
                    </div>
                  ) : (
                    <div className="space-y-2 ml-2 border-l-2 border-blue-200 dark:border-gray-600 pl-4">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lições:
                      </h4>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <Link 
                          key={lesson.id}
                          href={`/admin/courses/edit/${courseId}/${module.id}/lessons/${lesson.id}`}
                          className="block"
                        >
                          <div className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                              {lessonIndex + 1}
                            </div>
                            <span className="text-sm flex-1 font-medium text-gray-700 dark:text-gray-300">
                              {lesson.title}
                            </span>
                            <svg 
                              className="w-4 h-4 text-gray-400" 
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModuleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3">Confirmar Exclusão</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Tem certeza que deseja excluir este módulo? Esta ação é irreversível e irá remover:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>O módulo completo</li>
              <li>Todas as lições deste módulo</li>
              <li>Todo o conteúdo associado</li>
            </ul>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={() => setDeleteConfirmModuleId(null)}
                disabled={isDeletingModule}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteModule(deleteConfirmModuleId)}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeletingModule}
              >
                {isDeletingModule ? 'Excluindo...' : 'Confirmar Exclusão'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        courseId={courseId}
        onSuccess={() => {
          fetchModules();
        }}
      />
    </div>
  );
}
