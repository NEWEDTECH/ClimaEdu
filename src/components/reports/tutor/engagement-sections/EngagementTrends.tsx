import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EngagementTrends } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementTrendsProps = {
  data: EngagementTrends;
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function EngagementTrends({ data }: EngagementTrendsProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências de Engajamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Tendência Geral:</span>
          <Badge variant={data.overallTrend === 'IMPROVING' ? 'default' : data.overallTrend === 'DECLINING' ? 'destructive' : 'secondary'}>
            {data.overallTrend}
          </Badge>
        </div>

        <h4 className="font-semibold mb-2">Análise por Período</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Engajamento Médio</TableHead>
              <TableHead>Alunos Ativos</TableHead>
              <TableHead>Novos Riscos</TableHead>
              <TableHead>Alunos Recuperados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.periodAnalysis.map((period) => (
              <TableRow key={period.period}>
                <TableCell>{period.period}</TableCell>
                <TableCell>{period.averageEngagement}%</TableCell>
                <TableCell>{period.activeStudents}</TableCell>
                <TableCell>{period.newDropoutRisks}</TableCell>
                <TableCell>{period.recoveredStudents}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
