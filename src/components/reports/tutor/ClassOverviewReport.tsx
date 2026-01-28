"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
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

const CACHE_DURATION = 5 * 60 * 1000;

type CacheEntry = {
  data: GenerateClassOverviewReportOutput;
  timestamp: number;
};

const reportCache: Map<string, CacheEntry> = new Map();

interface ClassOverviewReportProps {
  courseId: string | null;
  classId: string | null;
}

export function ClassOverviewReport({ courseId, classId }: ClassOverviewReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateClassOverviewReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return `overview_${user?.id}_${user?.currentIdInstitution}_${courseId}_${classId}`;
  }, [user?.id, user?.currentIdInstitution, courseId, classId]);

  const fetchReport = useCallback(async () => {
    if (!user || !courseId) {
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
      const useCase = container.get<GenerateClassOverviewReportUseCase>(ReportSymbols.useCases.GenerateClassOverviewReportUseCase);
      const result = await useCase.execute({
        userId: user.id,
        tutorId: user.id,
        institutionId: user.currentIdInstitution,
        classId: classId || undefined,
        courseId,
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
      {report.classStatistics && <OverviewStatistics data={report.classStatistics} />}
      {report.alerts && <OverviewAlerts data={report.alerts} />}
      {report.students && <OverviewStudentList data={report.students} />}
      {report.trends && <OverviewTrends data={report.trends} />}
      {report.benchmarks && <OverviewBenchmarks data={report.benchmarks} />}
      {report.insights && <OverviewInsights data={report.insights} />}
    </div>
  );
}
