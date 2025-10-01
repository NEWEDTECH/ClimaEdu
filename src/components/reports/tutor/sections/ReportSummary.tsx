import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GenerateIndividualStudentReportOutput } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type ReportSummaryProps = {
  data: GenerateIndividualStudentReportOutput['summary'];
};

export function ReportSummary({ data }: ReportSummaryProps) {
  const getPerformanceVariant = (performance: string) => {
    switch (performance) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'default';
      case 'SATISFACTORY':
        return 'default';
      case 'NEEDS_IMPROVEMENT':
      case 'POOR':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'LOW_RISK':
        return 'default';
      case 'MEDIUM_RISK':
        return 'secondary';
      case 'HIGH_RISK':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Geral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Performance Geral:</span>
          <Badge variant={getPerformanceVariant(data.overallPerformance)}>
            {data.overallPerformance.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Risco de Evasão:</span>
          <Badge variant={getRiskVariant(data.riskAssessment)}>
            {data.riskAssessment.replace('_', ' ')}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium mb-2">Destaques:</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.keyHighlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Pontos de Atenção:</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.mainConcerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
