import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassStudentData } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewStudentListProps = {
  data: ClassStudentData[];
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function OverviewStudentList({ data }: OverviewStudentListProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const getRiskVariant = (risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho dos Alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Média</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead>Risco</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>{student.overallProgress}%</TableCell>
                <TableCell>{student.averageScore.toFixed(1)}%</TableCell>
                <TableCell>{student.daysSinceLastAccess} dias atrás</TableCell>
                <TableCell>
                  <Badge variant={getRiskVariant(student.riskLevel)}>{student.riskLevel}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
