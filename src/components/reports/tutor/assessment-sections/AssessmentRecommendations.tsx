import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationItem } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';

type AssessmentRecommendationsProps = {
  data: RecommendationItem[];
};

import { Badge } from '@/components/ui/badge';

export function AssessmentRecommendations({ data }: AssessmentRecommendationsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const getPriorityVariant = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((rec, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{rec.description}</p>
              <Badge variant={getPriorityVariant(rec.priority)}>{rec.priority}</Badge>
            </div>
            <p className="text-sm text-gray-600">Impacto Esperado: {rec.expectedImpact}</p>
            {rec.targetStudents && <p className="text-sm">Alunos Alvo: {rec.targetStudents.length}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
