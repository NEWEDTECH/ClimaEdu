"use client";

import React, { useEffect, useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { GenerateStudentAssessmentPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-assessment-performance-report/generate-student-assessment-performance-report.use-case';
import { GenerateStudentAssessmentPerformanceReportOutput, AssessmentPerformanceData } from '@/_core/modules/report/core/use-cases/generate-student-assessment-performance-report/generate-student-assessment-performance-report.output';
import { useProfile } from '@/context/zustand/useProfile';

export const AssessmentPerformanceReport = () => {
  const [reportData, setReportData] = useState<GenerateStudentAssessmentPerformanceReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {infoUser} = useProfile();

  useEffect(() => {
    const fetchReport = async () => {
      const generateReport = container.get<GenerateStudentAssessmentPerformanceReportUseCase>(
        Register.report.useCase.GenerateStudentAssessmentPerformanceReportUseCase
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
        setError('Falha ao carregar o relatório de desempenho.');
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
          <p>Não há dados de desempenho disponíveis para exibir no momento.</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, assessments, insights } = reportData;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Resumo Geral do Desempenho</CardTitle>
          <CardDescription>Sua performance consolidada em todas as avaliações.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Score Médio</p>
            <p className="text-2xl font-bold">{summary.averageScore.toFixed(1)}%</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Avaliações Feitas</p>
            <p className="text-2xl font-bold">{summary.totalSubmissions}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
            <p className="text-2xl font-bold">{summary.passRate.toFixed(1)}%</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Melhor Nota</p>
            <p className="text-2xl font-bold">{summary.highestScore.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      {assessments && assessments.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes das Avaliações</CardTitle>
            <CardDescription>Seu desempenho em cada avaliação individual.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {assessments.map((assessment: AssessmentPerformanceData) => (
                <AccordionItem value={assessment.submissionId} key={assessment.submissionId}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{assessment.questionnaireTitle}</span>
                      <span className={assessment.passed ? 'text-green-600' : 'text-red-600'}>
                        {assessment.score.toFixed(1)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      <li>Curso: {assessment.courseTitle}</li>
                      <li>Data: {new Date(assessment.completedAt).toLocaleDateString()}</li>
                      <li>Tentativas: {assessment.attemptNumber}/{assessment.maxAttempts}</li>
                      <li>Acertos: {assessment.correctAnswers}/{assessment.totalQuestions}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {insights && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
            <CardDescription>Sugestões para melhorar seu desempenho.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {insights.strengths.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-700">Pontos Fortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 text-sm">
                    {insights.strengths.map((strength: string) => <li key={strength}>{strength}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
            {insights.improvementAreas.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-amber-700">Áreas de Melhoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 text-sm">
                    {insights.improvementAreas.map((area: string) => <li key={area}>{area}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
