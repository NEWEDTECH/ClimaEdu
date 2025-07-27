import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceTrend } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';

type AssessmentTrendsProps = {
  data: PerformanceTrend[];
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AssessmentTrends({ data }: AssessmentTrendsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências de Desempenho</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Média de Notas</TableHead>
              <TableHead>Nº de Envios</TableHead>
              <TableHead>Taxa de Aprovação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((trend) => (
              <TableRow key={trend.period}>
                <TableCell>{trend.period}</TableCell>
                <TableCell>{trend.averageScore.toFixed(1)}%</TableCell>
                <TableCell>{trend.submissionCount}</TableCell>
                <TableCell>{trend.passRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
