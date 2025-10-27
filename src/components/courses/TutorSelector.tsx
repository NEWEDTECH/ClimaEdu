'use client';

import { SelectComponent } from '@/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/_core/modules/user/core/entities/User';

export type TutorOption = {
  id: string;
  email: string;
  name: string;
};

type TutorSelectorProps = {
  availableTutors: User[];
  selectedTutorIds: string[];
  onAddTutor: (tutorId: string) => void;
  isLoading?: boolean;
};

export function TutorSelector({
  availableTutors,
  selectedTutorIds,
  onAddTutor,
  isLoading = false,
}: TutorSelectorProps) {
  const unselectedTutors = availableTutors.filter(
    (tutor) => !selectedTutorIds.includes(tutor.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Tutor</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando tutores disponíveis...</p>
        ) : unselectedTutors.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todos os tutores disponíveis já foram adicionados ao curso.
          </p>
        ) : (
          <div className="space-y-2">
            <SelectComponent
              value=""
              onChange={(value) => {
                if (value) {
                  onAddTutor(value);
                }
              }}
              options={unselectedTutors.map((tutor) => ({
                value: tutor.id,
                label: `${tutor.name} (${tutor.email.value})`,
              }))}
              placeholder="Selecione um tutor para adicionar"
            />
            <p className="text-xs text-gray-500">
              Selecione um tutor da lista para associá-lo ao curso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
