'use client';

import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type ContentManagerInfo = {
  id: string;
  email: string;
  name?: string;
};

type ContentManagersListProps = {
  contentManagers: ContentManagerInfo[];
  onRemoveContentManager: (managerId: string) => void;
  isLoading?: boolean;
};

export function ContentManagersList({
  contentManagers,
  onRemoveContentManager,
  isLoading = false,
}: ContentManagersListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestores de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando gestores de conteúdo...</p>
        </CardContent>
      </Card>
    );
  }

  if (contentManagers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestores de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhum gestor de conteúdo associado a este curso.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestores de Conteúdo ({contentManagers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-3 ${contentManagers.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
          {contentManagers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {manager.name || manager.email}
                </div>
                {manager.name && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{manager.email}</div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => onRemoveContentManager(manager.id)}
                variant="secondary"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
