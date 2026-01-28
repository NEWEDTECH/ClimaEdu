"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateClassAssessmentPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.use-case';
import { GenerateClassAssessmentPerformanceReportOutput, AssessmentStatistics, StudentPerformance } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ReportSymbols } from '@/_core/shared/container/symbols';
import { AssessmentTrends } from './assessment-sections/AssessmentTrends';
import { AssessmentRecommendations } from './assessment-sections/AssessmentRecommendations';
import { AssessmentInsights } from './assessment-sections/AssessmentInsights';
import { AssessmentComparison } from './assessment-sections/AssessmentComparison';

const CACHE_DURATION = 5 * 60 * 1000;

type CacheEntry = {
  data: GenerateClassAssessmentPerformanceReportOutput;
  timestamp: number;
};

const reportCache: Map<string, CacheEntry> = new Map();

interface ClassAssessmentPerformanceReportProps {
  courseId: string | null;
  classId: string | null;
}

export function ClassAssessmentPerformanceReport({ courseId, classId }: ClassAssessmentPerformanceReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateClassAssessmentPerformanceReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return `assessment_${user?.id}_${user?.currentIdInstitution}_${courseId}_${classId}`;
  }, [user?.id, user?.currentIdInstitution, courseId, classId]);

  const fetchReport = useCallback(async () => {
    if (!user || !courseId || !classId) {
      setReport(null);
      return;
    }

    const cacheKey = getCacheKey();
    const cached = reportCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setReport(cached.data);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const useCase = container.get<GenerateClassAssessmentPerformanceReportUseCase>(ReportSymbols.useCases.GenerateClassAssessmentPerformanceReportUseCase);
      const result = await useCase.execute({
        tutorId: user.id,
        institutionId: user.currentIdInstitution,
        classId,
        courseId,
        includeIndividualScores: true,
        includeStatistics: true,
        includeTrends: true,
        includeQuestionAnalysis: true,
      });

      reportCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setReport(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [user, courseId, classId, getCacheKey]);

  useEffect(() => {
    fetchReport();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchReport]);

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
          <CardTitle>Visão Geral das Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.assessmentOverview.totalAssessments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.assessmentOverview.averageScore.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.assessmentOverview.passRate.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.assessmentOverview.completionRate.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Médias de Tentativas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.assessmentOverview.averageAttempts.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avaliação</TableHead>
                <TableHead>Média</TableHead>
                <TableHead>Maior Nota</TableHead>
                <TableHead>Menor Nota</TableHead>
                <TableHead>Taxa de Aprovação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.assessmentStatistics?.map((assessment: AssessmentStatistics) => (
                <TableRow key={assessment.assessmentId}>
                  <TableCell>{assessment.assessmentName}</TableCell>
                  <TableCell>{assessment.averageScore.toFixed(2)}%</TableCell>
                  <TableCell>{assessment.highestScore.toFixed(2)}%</TableCell>
                  <TableCell>{assessment.lowestScore.toFixed(2)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{assessment.passRate.toFixed(2)}%</span>
                      <Progress value={assessment.passRate} className="w-24" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Média</TableHead>
                <TableHead>Melhor Nota</TableHead>
                <TableHead>Pior Nota</TableHead>
                <TableHead>Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.studentPerformances?.map((student: StudentPerformance) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>{student.averageScore.toFixed(2)}%</TableCell>
                  <TableCell>{student.bestScore.toFixed(2)}%</TableCell>
                  <TableCell>{student.worstScore.toFixed(2)}%</TableCell>
                  <TableCell>{student.improvementTrend}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {report.insights && <AssessmentInsights data={report.insights} />}
        {report.recommendations && <AssessmentRecommendations data={report.recommendations} />}
      </div>

      {report.performanceTrends && <AssessmentTrends data={report.performanceTrends} />}
      {report.classComparison && <AssessmentComparison data={report.classComparison} />}
    </div>
  );
}
