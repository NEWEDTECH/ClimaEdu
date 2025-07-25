"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateClassAssessmentPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.use-case';
import { GenerateClassAssessmentPerformanceReportOutput, AssessmentStatistics, StudentPerformance } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ReportSymbols } from '@/_core/shared/container/symbols';

interface ClassAssessmentPerformanceReportProps {
  courseId: string | null;
  classId: string | null;
}

export function ClassAssessmentPerformanceReport({ courseId, classId }: ClassAssessmentPerformanceReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateClassAssessmentPerformanceReportOutput | null>(null);
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
        const useCase = container.get<GenerateClassAssessmentPerformanceReportUseCase>(ReportSymbols.useCases.GenerateClassAssessmentPerformanceReportUseCase);
        const result = await useCase.execute({
          tutorId: user.id,
          institutionId: user.currentIdInstitution,
          classId,
          courseId,
          includeIndividualScores: true,
          includeStatistics: true,
        });
        console.log('🙋‍♂️ Report Data:', result);
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
        <Card>
          <CardHeader>
            <CardTitle>Alunos em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.insights.topPerformers.map(student => (
                <li key={student.studentId} className="flex justify-between">
                  <span>{student.studentName}</span>
                  <span className="font-semibold">{student.averageScore.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alunos que Precisam de Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.insights.strugglingStudents.map(student => (
                <li key={student.studentId} className="flex justify-between">
                  <span>{student.studentName}</span>
                  <span className="font-semibold">{student.averageScore.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
