"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateEngagementRetentionReportUseCase } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.use-case';
import { GenerateEngagementRetentionReportOutput, StudentEngagementData } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ReportSymbols } from '@/_core/shared/container/symbols';

interface EngagementRetentionReportProps {
  courseId: string | null;
  classId: string | null;
}

export function EngagementRetentionReport({ courseId, classId }: EngagementRetentionReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateEngagementRetentionReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !courseId || !classId) {
      setReport(null);
      return;
    };

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const useCase = container.get<GenerateEngagementRetentionReportUseCase>(ReportSymbols.useCases.GenerateStudentEngagementRetentionReportUseCase);
        const result = await useCase.execute({
          tutorId: user.id,
          institutionId: user.currentIdInstitution,
          classId,
          courseId,
          includeStudentDetails: true,
        });
        setReport(result);
      } catch (err) {
        console.error(err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user, courseId, classId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!report) {
    return <div>No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saúde da Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.classOverview.classHealthScore.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.classOverview.averageEngagementScore.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.retentionMetrics.overallRetentionRate.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alunos em Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.dropoutRisk.highRiskStudents}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes de Engajamento por Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Nível de Engajamento</TableHead>
                <TableHead>Nível de Risco</TableHead>
                <TableHead>Último Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.studentDetails?.map((student: StudentEngagementData) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{student.engagementLevel}</span>
                      <Progress value={student.engagementScore} className="w-24" />
                    </div>
                  </TableCell>
                  <TableCell>{student.riskLevel}</TableCell>
                  <TableCell>{student.daysSinceLastAccess} dias atrás</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
