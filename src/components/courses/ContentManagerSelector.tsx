'use client';

import { SelectComponent } from '@/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/_core/modules/user/core/entities/User';

type ContentManagerSelectorProps = {
  availableContentManagers: User[];
  selectedContentManagerIds: string[];
  onAddContentManager: (managerId: string) => void;
  isLoading?: boolean;
};

export function ContentManagerSelector({
  availableContentManagers,
  selectedContentManagerIds,
  onAddContentManager,
  isLoading = false,
}: ContentManagerSelectorProps) {
  // Filter out managers already added to THIS course
  const unselectedManagers = availableContentManagers.filter(
    (manager) => !selectedContentManagerIds.includes(manager.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Gestor de Conteúdo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando gestores disponíveis...</p>
        ) : availableContentManagers.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum gestor de conteúdo disponível na instituição.
          </p>
        ) : unselectedManagers.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todos os gestores de conteúdo da instituição já foram adicionados a este curso.
          </p>
        ) : (
          <div className="space-y-2">
            <SelectComponent
              value=""
              onChange={(value) => {
                if (value) {
                  onAddContentManager(value);
                }
              }}
              options={unselectedManagers.map((manager) => ({
                value: manager.id,
                label: `${manager.name} (${manager.email.value})`,
              }))}
              placeholder="Selecione um gestor de conteúdo para adicionar"
            />
            <p className="text-xs text-gray-500">
              Selecione um gestor de conteúdo da lista para associá-lo ao curso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
