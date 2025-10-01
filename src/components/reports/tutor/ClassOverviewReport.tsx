"use client";

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateClassOverviewReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.use-case';
import { GenerateClassOverviewReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';
import { ReportSymbols } from '@/_core/shared/container/symbols';
import { OverviewStatistics } from './overview-sections/OverviewStatistics';
import { OverviewStudentList } from './overview-sections/OverviewStudentList';
import { OverviewAlerts } from './overview-sections/OverviewAlerts';
import { OverviewTrends } from './overview-sections/OverviewTrends';
import { OverviewBenchmarks } from './overview-sections/OverviewBenchmarks';
import { OverviewInsights } from './overview-sections/OverviewInsights';

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
    <div className="space-y-6">
      {report.classStatistics && <OverviewStatistics data={report.classStatistics} />}
      {report.alerts && <OverviewAlerts data={report.alerts} />}
      {report.students && <OverviewStudentList data={report.students} />}
      {report.trends && <OverviewTrends data={report.trends} />}
      {report.benchmarks && <OverviewBenchmarks data={report.benchmarks} />}
      {report.insights && <OverviewInsights data={report.insights} />}
    </div>
  );
}
