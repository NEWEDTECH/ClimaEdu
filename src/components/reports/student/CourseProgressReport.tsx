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
import { GenerateStudentCourseProgressReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-course-progress-report';
import { GenerateStudentCourseProgressReportOutput, CourseProgressData } from '@/_core/modules/report/core/use-cases/generate-student-course-progress-report/generate-student-course-progress-report.output';
import { useProfile } from '@/context/zustand/useProfile';

export const CourseProgressReport = () => {
  const [reportData, setReportData] = useState<GenerateStudentCourseProgressReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {infoUser} = useProfile();

  useEffect(() => {
    const fetchReport = async () => {
      const generateReport = container.get<GenerateStudentCourseProgressReportUseCase>(
        Register.report.useCase.GenerateStudentCourseProgressReportUseCase
      );

      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual data from auth context
        const data = await generateReport.execute({
          userId: infoUser.id,
          institutionId: infoUser.currentIdInstitution,
          includeCompletedCourses: true,
          includeInProgressCourses: true,
        });
        setReportData(data);
      } catch (err) {
        setError('Falha ao carregar o relatório de progresso.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

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

  if (!reportData || reportData.courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não há dados de progresso em cursos para exibir no momento.</p>
        </CardContent>
      </Card>
    );
  }

  const { totalEnrolledCourses, completedCourses, inProgressCourses, overallProgressPercentage, courses } = reportData;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral do Progresso</CardTitle>
          <CardDescription>Seu progresso consolidado em todos os cursos.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Cursos Matriculados</p>
            <p className="text-2xl font-bold">{totalEnrolledCourses}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
            <p className="text-2xl font-bold">{completedCourses}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-bold">{inProgressCourses}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Progresso Geral</p>
            <p className="text-2xl font-bold">{overallProgressPercentage.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Curso</CardTitle>
          <CardDescription>Seu desempenho em cada curso individualmente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {courses.map((course: CourseProgressData) => (
              <AccordionItem value={course.courseId} key={course.courseId}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span>{course.courseTitle}</span>
                    <span className="font-mono text-sm">{course.progressPercentage.toFixed(0)}%</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="text-muted-foreground">{course.courseDescription}</p>
                    <div className="border-t my-2"></div>
                    <p><strong>Status:</strong> {course.status}</p>
                    <p><strong>Aulas Concluídas:</strong> {course.completedLessons}/{course.totalLessons}</p>
                    <p><strong>Tempo de Estudo:</strong> {formatTime(course.totalTimeSpent)}</p>
                    {course.lastAccessedAt && <p><strong>Último Acesso:</strong> {new Date(course.lastAccessedAt).toLocaleDateString()}</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
