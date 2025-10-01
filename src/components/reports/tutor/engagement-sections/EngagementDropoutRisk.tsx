import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropoutRiskAnalysis } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementDropoutRiskProps = {
  data: DropoutRiskAnalysis;
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function EngagementDropoutRisk({ data }: EngagementDropoutRiskProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Risco de Evasão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-medium">Risco Alto</p>
            <p className="text-2xl font-bold text-red-600">{data.highRiskStudents}</p>
          </div>
          <div>
            <p className="font-medium">Risco Médio</p>
            <p className="text-2xl font-bold text-yellow-600">{data.mediumRiskStudents}</p>
          </div>
          <div>
            <p className="font-medium">Risco Baixo</p>
            <p className="text-2xl font-bold text-green-600">{data.lowRiskStudents}</p>
          </div>
        </div>

        {data.criticalStudents.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Alunos em Estado Crítico</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Dias Sem Acesso</TableHead>
                  <TableHead>Score de Engajamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.criticalStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.daysSinceLastAccess}</TableCell>
                    <TableCell>{student.engagementScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Principais Fatores de Risco</h4>
          <div className="flex flex-wrap gap-2">
            {data.riskFactors.map((factor, index) => (
              <Badge key={index} variant="destructive">
                {factor.factor} ({factor.affectedStudents} alunos)
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
