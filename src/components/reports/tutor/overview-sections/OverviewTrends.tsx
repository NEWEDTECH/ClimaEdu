import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateClassOverviewReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewTrendsProps = {
  data: GenerateClassOverviewReportOutput['trends'];
};

export function OverviewTrends({ data }: OverviewTrendsProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências da Turma</CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">Padrões de Engajamento</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <p>Pico de Estudo (Dias): {data.engagementPatterns.peakStudyDays.join(', ')}</p>
          <p>Pico de Estudo (Horas): {data.engagementPatterns.peakStudyHours.join(', ')}h</p>
          <p>Sessões/Semana: {data.engagementPatterns.averageSessionsPerWeek.toFixed(1)}</p>
          <p>Taxa de Retenção: {data.engagementPatterns.retentionRate.toFixed(1)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
