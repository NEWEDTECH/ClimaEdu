import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndividualClassComparison } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type ClassComparisonProps = {
  data: IndividualClassComparison;
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ClassComparison({ data }: ClassComparisonProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo com a Turma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <p className="font-medium">Tamanho da Turma</p>
            <p className="text-2xl font-bold">{data.classSize}</p>
          </div>
          <div>
            <p className="font-medium">Ranking do Aluno</p>
            <p className="text-2xl font-bold">{data.studentRank}º</p>
          </div>
          <div>
            <p className="font-medium">Percentil</p>
            <p className="text-2xl font-bold">{data.percentileRank}%</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Média da Turma</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.comparisonMetrics.map((metric, index) => (
              <TableRow key={index}>
                <TableCell>{metric.metric}</TableCell>
                <TableCell>{metric.studentValue.toFixed(1)}</TableCell>
                <TableCell>{metric.classAverage.toFixed(1)}</TableCell>
                <TableCell>{metric.studentPerformance.replace('_', ' ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
