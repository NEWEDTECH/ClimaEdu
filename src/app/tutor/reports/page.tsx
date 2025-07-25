"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function TutorReports() {
  const { infoUser: user } = useProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchClasses = async () => {
      const listClassesUseCase = container.get<ListClassesUseCase>(Register.enrollment.useCase.ListClassesUseCase);
      const result = await listClassesUseCase.execute({ institutionId: user.currentIdInstitution });
      setClasses(result.classes);
    };

    fetchClasses();
  }, [user]);

  const handleClassSelect = (classId: string) => {
    const selected = classes.find(c => c.id === classId);
    if (selected) {
      setSelectedClass(selected.id);
      setSelectedCourse(selected.courseId);
    }
  };

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
                <span>{selectedClass ? classes.find(c => c.id === selectedClass)?.name : "Selecione uma turma"}</span>
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px]">
              {classes.map((cls) => (
                <DropdownMenuItem key={cls.id} onSelect={() => handleClassSelect(cls.id)}>
                  {cls.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="class-overview">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="class-overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="assessment-performance">Avaliações</TabsTrigger>
              <TabsTrigger value="engagement-retention">Engajamento</TabsTrigger>
              <TabsTrigger value="individual-tracking">Acompanhamento Individual</TabsTrigger>
            </TabsList>
            <TabsContent value="class-overview" className="mt-4">
              <ClassOverviewReport courseId={selectedCourse} classId={selectedClass} />
            </TabsContent>
            <TabsContent value="assessment-performance" className="mt-4">
              <ClassAssessmentPerformanceReport courseId={selectedCourse} classId={selectedClass} />
            </TabsContent>
            <TabsContent value="engagement-retention" className="mt-4">
              <EngagementRetentionReport courseId={selectedCourse} classId={selectedClass} />
            </TabsContent>
            <TabsContent value="individual-tracking" className="mt-4">
              <IndividualStudentTrackingReport courseId={selectedCourse} classId={selectedClass} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
