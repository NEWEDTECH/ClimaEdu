import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateClassOverviewReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewBenchmarksProps = {
  data: GenerateClassOverviewReportOutput['benchmarks'];
};

export function OverviewBenchmarks({ data }: OverviewBenchmarksProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmarks</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div>
          <p className="font-medium">Média da Instituição</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <p>Progresso: {data.institutionAverage.progress}%</p>
            <p>Desempenho: {data.institutionAverage.performance}%</p>
            <p>Engajamento: {data.institutionAverage.engagement}%</p>
          </div>
        </div>
        <div>
          <p className="font-medium">Comparativo com Período Anterior</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <p>Progresso: {data.previousPeriod.progressChange}%</p>
            <p>Desempenho: {data.previousPeriod.performanceChange}%</p>
            <p>Engajamento: {data.previousPeriod.engagementChange}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
