import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RetentionMetrics } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementRetentionMetricsProps = {
  data: RetentionMetrics;
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function EngagementRetentionMetrics({ data }: EngagementRetentionMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Retenção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="font-medium">Taxa de Retenção Geral</p>
          <p className="text-3xl font-bold text-green-600">{data.overallRetentionRate.toFixed(1)}%</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Retenção por Período</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Taxa de Retenção</TableHead>
                <TableHead>Alunos Retidos</TableHead>
                <TableHead>Alunos Perdidos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.retentionByPeriod.map((periodData) => (
                <TableRow key={periodData.period}>
                  <TableCell>{periodData.period}</TableCell>
                  <TableCell>{periodData.retentionRate.toFixed(1)}%</TableCell>
                  <TableCell>{periodData.studentsRetained}</TableCell>
                  <TableCell>{periodData.studentsLost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
