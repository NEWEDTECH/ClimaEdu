"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsTrigger } from '@/components/tabs/TabsTrigger';
import { ClassOverviewReport } from '@/components/reports/tutor/ClassOverviewReport';
import { ClassAssessmentPerformanceReport } from '@/components/reports/tutor/ClassAssessmentPerformanceReport';
import { EngagementRetentionReport } from '@/components/reports/tutor/EngagementRetentionReport';
import { IndividualStudentTrackingReport } from '@/components/reports/tutor/IndividualStudentTrackingReport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { container } from '@/_core/shared/container';
import { ListClassesUseCase } from '@/_core/modules/enrollment/core/use-cases/list-classes/list-classes.use-case';
import { useProfile } from '@/context/zustand/useProfile';
import { Class } from '@/_core/modules/enrollment/core/entities/Class';
import { Register } from '@/_core/shared/container/symbols';
import { LoadingSpinner } from '@/components/loader';

const CACHE_DURATION = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const classesCache: Map<string, CacheEntry<Class[]>> = new Map();

export default function TutorReports() {
  const { infoUser: user } = useProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('class-overview');
  const [isLoading, setIsLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!user?.currentIdInstitution) return;

    const cacheKey = user.currentIdInstitution;
    const cached = classesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setClasses(cached.data);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const listClassesUseCase = container.get<ListClassesUseCase>(Register.enrollment.useCase.ListClassesUseCase);
      const result = await listClassesUseCase.execute({ institutionId: user.currentIdInstitution });

      classesCache.set(cacheKey, {
        data: result.classes,
        timestamp: Date.now()
      });

      setClasses(result.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.currentIdInstitution]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleClassSelect = useCallback((classId: string) => {
    const selected = classes.find(c => c.id === classId);
    if (selected) {
      setSelectedClass(selected.id);
      setSelectedCourse(selected.courseId);
    }
  }, [classes]);

  const selectedClassName = useMemo(() => {
    if (!selectedClass) return "Selecione uma turma";
    return classes.find(c => c.id === selectedClass)?.name || "Selecione uma turma";
  }, [selectedClass, classes]);

  const reportProps = useMemo(() => ({
    courseId: selectedCourse,
    classId: selectedClass
  }), [selectedCourse, selectedClass]);

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Relatórios da Turma</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho, progresso e engajamento de seus alunos.
          </p>
        </div>

        <div className="flex gap-4 my-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-between">
                <span>{selectedClassName}</span>
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px]">
              {classes.length === 0 ? (
                <DropdownMenuItem disabled>Nenhuma turma encontrada</DropdownMenuItem>
              ) : (
                classes.map((cls) => (
                  <DropdownMenuItem key={cls.id} onSelect={() => handleClassSelect(cls.id)}>
                    {cls.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:grid-cols-4">
                <TabsTrigger value="class-overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="assessment-performance">Avaliações</TabsTrigger>
                <TabsTrigger value="engagement-retention">Engajamento</TabsTrigger>
                <TabsTrigger value="individual-tracking">Acompanhamento Individual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-4">
            {activeTab === 'class-overview' && (
              <ClassOverviewReport {...reportProps} />
            )}
            {activeTab === 'assessment-performance' && (
              <ClassAssessmentPerformanceReport {...reportProps} />
            )}
            {activeTab === 'engagement-retention' && (
              <EngagementRetentionReport {...reportProps} />
            )}
            {activeTab === 'individual-tracking' && (
              <IndividualStudentTrackingReport {...reportProps} />
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
