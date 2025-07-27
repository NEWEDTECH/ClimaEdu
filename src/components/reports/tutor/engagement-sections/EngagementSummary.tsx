import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateEngagementRetentionReportOutput } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementSummaryProps = {
  data: GenerateEngagementRetentionReportOutput['summary'];
};

import { Badge } from '@/components/ui/badge';

export function EngagementSummary({ data }: EngagementSummaryProps) {
  const getHealthVariant = (health: string) => {
    switch (health) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'default';
      case 'CONCERNING':
        return 'secondary';
      case 'CRITICAL':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Engajamento da Turma</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Saúde Geral da Turma:</span>
          <Badge variant={getHealthVariant(data.overallHealth)}>
            {data.overallHealth}
          </Badge>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Principais Conclusões:</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.keyFindings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>
        </div>

        {data.urgentActions.length > 0 && data.urgentActions[0] !== 'Nenhuma ação urgente identificada' && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">Ações Urgentes:</h4>
            <ul className="list-disc list-inside space-y-1 text-red-600">
              {data.urgentActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">Indicadores Positivos:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              {data.positiveIndicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-600 mb-2">Indicadores de Risco:</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {data.riskIndicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
