"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateClassOverviewReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.use-case';
import { GenerateClassOverviewReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';
import { ReportSymbols } from '@/_core/shared/container/symbols';

interface ClassOverviewReportProps {
  courseId: string | null;
  classId: string | null;
}

export function ClassOverviewReport({ courseId, classId }: ClassOverviewReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateClassOverviewReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !courseId) {
      setReport(null);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const useCase = container.get<GenerateClassOverviewReportUseCase>(ReportSymbols.useCases.GenerateClassOverviewReportUseCase);
        const result = await useCase.execute({
          userId: user.id,
          tutorId: user.id,
          institutionId: user.currentIdInstitution,
          classId: classId || undefined,
          courseId,
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
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral da Turma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.classStatistics.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alunos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.classStatistics.activeStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progresso Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.classStatistics.averageProgress.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Média da Turma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.classStatistics.classAverageScore.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
