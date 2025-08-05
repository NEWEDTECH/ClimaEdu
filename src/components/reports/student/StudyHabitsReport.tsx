"use client";

import React, { useEffect, useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/context/zustand/useProfile';
import { GenerateStudentStudyHabitsReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-study-habits-report';
import { GenerateStudentStudyHabitsReportOutput } from '@/_core/modules/report/core/use-cases/generate-student-study-habits-report/generate-student-study-habits-report.output';

export const StudyHabitsReport = () => {
  const [reportData, setReportData] = useState<GenerateStudentStudyHabitsReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { infoUser } = useProfile();

  useEffect(() => {
    if (!infoUser.id) return;

    const fetchReport = async () => {
      const generateReport = container.get<GenerateStudentStudyHabitsReportUseCase>(
        Register.report.useCase.GenerateStudentStudyHabitsReportUseCase
      );

      setLoading(true);
      setError(null);
      try {
        const data = await generateReport.execute({
          userId: infoUser.id,
          institutionId: infoUser.currentIdInstitution,
        });
        setReportData(data);
      } catch (err) {
        setError('Falha ao carregar o relatório de hábitos de estudo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [infoUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando relatório...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao Carregar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não há dados de hábitos de estudo para exibir. Comece a estudar para ver seus insights!</p>
        </CardContent>
      </Card>
    );
  }

  const { overallStats, productivity, insights } = reportData;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Hábitos de Estudo</CardTitle>
          <CardDescription>Uma visão geral dos seus padrões de estudo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Tempo Total</p>
            <p className="text-2xl font-bold">{formatTime(overallStats.totalStudyTime)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Sessões de Estudo</p>
            <p className="text-2xl font-bold">{overallStats.totalSessions}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Média Diária</p>
            <p className="text-2xl font-bold">{formatTime(overallStats.averageDailyTime)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Sequência Atual</p>
            <p className="text-2xl font-bold">{overallStats.currentStreak} dias</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtividade e Foco</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Pontuação de Foco</p>
            <p className="text-2xl font-bold">{productivity.focusScore}/100</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Consistência</p>
            <p className="text-2xl font-bold">{productivity.consistencyScore}/100</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Duração Média</p>
            <p className="text-2xl font-bold">{productivity.averageSessionLength.toFixed(0)} min</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Melhor Horário</p>
            <p className="text-2xl font-bold">{productivity.peakProductivityHours[0] || 'N/A'}h</p>
          </div>
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {insights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
