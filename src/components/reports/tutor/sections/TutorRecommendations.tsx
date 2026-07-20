import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TutorRecommendations } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';
import { translateEnum } from '../../shared/translations';

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
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Recomendações e Próximos Passos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.immediateActions.length > 0 && (
          <div>
            <h4 className="font-bold text-lg mb-2 text-red-700 dark:text-red-400">Ações Imediatas</h4>
            <div className="space-y-3">
              {data.immediateActions.map((action, index) => (
                <div key={index} className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900 dark:text-white">{action.action}</p>
                    <Badge variant={getPriorityVariant(action.priority)}>{translateEnum(action.priority)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{action.reason}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Resultado Esperado: {action.expectedOutcome}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Pontos Fortes</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-400">
              {data.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Pontos de Melhoria</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-400">
              {data.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {data.interventionSuggestions.length > 0 && (
          <div>
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Sugestões de Intervenção</h4>
            <div className="space-y-3">
              {data.interventionSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border border-amber-200 dark:border-gray-700 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white">{suggestion.suggestion}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tipo: {translateEnum(suggestion.type)} | Prazo: {suggestion.timeline}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">Recursos: {suggestion.resources.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Próximos Passos</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {data.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
