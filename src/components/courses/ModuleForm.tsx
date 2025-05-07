'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import Link from 'next/link';
import { container, Register } from '@/_core/shared/container';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { CreateModuleUseCase } from '@/_core/modules/content/core/use-cases/create-module/create-module.use-case';

type ModuleData = {
  id: string;
  title: string;
  order: number;
  lessonsCount: number;
}

type ModuleFormProps = {
  courseId: string;
}

export function ModuleForm({ courseId }: ModuleFormProps) {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
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
        lessonsCount: module.lessons.length
      }));

      modulesData.sort((a, b) => a.order - b.order);

      setModules(modulesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Falha ao carregar módulos');
      setIsLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

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
        lessonsCount: 0
      }]);

      setNewModuleTitle('');
      setShowModuleForm(false);
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
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Módulos do Curso</CardTitle>
          <Button
            onClick={() => {
              setShowModuleForm(!showModuleForm);
            }}
            type="button"
            className="text-xs px-3 py-1"
          >
            {showModuleForm ? 'Cancelar' : 'Adicionar Módulo'}
          </Button>
        </div>
        <CardDescription>
          Gerencie os módulos deste curso
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showModuleForm && (
          <div className="mb-6 p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-3">Novo Módulo</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="moduleTitle" className="text-sm font-medium">
                  Título do Módulo
                </label>
                <InputText
                  id="moduleTitle"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Digite o título do módulo"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={isCreatingModule}
                  className="text-xs px-3 py-1"
                  onClick={() => {
                    handleCreateModule(new Event('click') as any);
                  }}
                >
                  {isCreatingModule ? 'Criando...' : 'Criar Módulo'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Este curso ainda não possui módulos. Adicione um módulo para começar.
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {index + 1}. {module.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {module.lessonsCount} {module.lessonsCount === 1 ? 'lição' : 'lições'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/courses/edit/${courseId}/modules/${module.id}`}>
                      <Button className="border bg-transparent text-xs px-3 py-1 hover:bg-gray-100">Editar</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
