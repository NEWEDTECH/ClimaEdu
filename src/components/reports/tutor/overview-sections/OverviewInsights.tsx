import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateClassOverviewReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewInsightsProps = {
  data: GenerateClassOverviewReportOutput['insights'];
};

export function OverviewInsights({ data }: OverviewInsightsProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights da Turma</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Oportunidades de Melhoria</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.improvementOpportunities.map((opportunity, index) => (
              <li key={index}>{opportunity}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Fatores de Sucesso</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.successFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Intervenções Recomendadas</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.recommendedInterventions.map((intervention, index) => (
              <li key={index}>
                {intervention.intervention} (Alunos: {intervention.targetStudents.length})
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
