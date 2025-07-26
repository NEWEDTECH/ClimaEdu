import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TutorRecommendations } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type TutorRecommendationsProps = {
  data: TutorRecommendations;
};

export function TutorRecommendations({ data }: TutorRecommendationsProps) {
  const getPriorityVariant = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'default';
    }
  };

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle>Recomendações e Próximos Passos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.immediateActions.length > 0 && (
          <div>
            <h4 className="font-bold text-lg mb-2 text-red-700">Ações Imediatas</h4>
            <div className="space-y-3">
              {data.immediateActions.map((action, index) => (
                <div key={index} className="p-3 bg-red-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{action.action}</p>
                    <Badge variant={getPriorityVariant(action.priority)}>{action.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{action.reason}</p>
                  <p className="text-sm font-medium">Resultado Esperado: {action.expectedOutcome}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg mb-2">Pontos Fortes</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              {data.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Pontos de Melhoria</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {data.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {data.interventionSuggestions.length > 0 && (
          <div>
            <h4 className="font-bold text-lg mb-2">Sugestões de Intervenção</h4>
            <div className="space-y-3">
              {data.interventionSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="font-semibold">{suggestion.suggestion}</p>
                  <p className="text-sm text-gray-600">
                    Tipo: {suggestion.type} | Prazo: {suggestion.timeline}
                  </p>
                  <p className="text-sm">Recursos: {suggestion.resources.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-bold text-lg mb-2">Próximos Passos</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
