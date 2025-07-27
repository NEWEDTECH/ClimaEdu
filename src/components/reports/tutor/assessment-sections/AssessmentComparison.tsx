import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassComparison } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';

type AssessmentComparisonProps = {
  data: ClassComparison;
};

export function AssessmentComparison({ data }: AssessmentComparisonProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo de Desempenho</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-medium">Média da Turma</p>
          <p className="text-2xl font-bold">{data.currentClassAverage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="font-medium">Média do Curso</p>
          <p className="text-2xl font-bold">{data.courseAverage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="font-medium">Média da Instituição</p>
          <p className="text-2xl font-bold">{data.institutionAverage.toFixed(1)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
