'use client';

import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TutorInfo = {
  id: string;
  email: string;
  name?: string;
};

type CourseTutorsListProps = {
  tutors: TutorInfo[];
  onRemoveTutor: (tutorId: string) => void;
  isLoading?: boolean;
};

export function CourseTutorsList({ tutors, onRemoveTutor, isLoading = false }: CourseTutorsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tutores do Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando tutores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutores do Curso ({tutors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-3 ${tutors.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {tutor.name || tutor.email}
                </div>
                {tutor.name && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{tutor.email}</div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => onRemoveTutor(tutor.id)}
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
