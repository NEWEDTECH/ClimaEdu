"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentPerformanceReport } from '@/components/reports/student/AssessmentPerformanceReport';
import { CourseProgressReport } from '@/components/reports/student/CourseProgressReport';
import { BadgesReport } from '@/components/reports/student/BadgesReport';
import { CertificatesReport } from '@/components/reports/student/CertificatesReport';
import { StudyHabitsReport } from '@/components/reports/student/StudyHabitsReport';

export default function StudentReports() {
  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Meus Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe seu desempenho, progresso e conquistas na plataforma.
          </p>
        </div>
        <div className="mt-6">
          <Tabs defaultValue="assessment-performance">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="assessment-performance">Avaliações</TabsTrigger>
              <TabsTrigger value="course-progress">Progresso</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="certificates">Certificados</TabsTrigger>
              <TabsTrigger value="study-habits">Hábitos</TabsTrigger>
            </TabsList>
            <TabsContent value="assessment-performance" className="mt-4">
              <AssessmentPerformanceReport />
            </TabsContent>
            <TabsContent value="course-progress" className="mt-4">
              <CourseProgressReport />
            </TabsContent>
            <TabsContent value="badges" className="mt-4">
              <BadgesReport />
            </TabsContent>
            <TabsContent value="certificates" className="mt-4">
              <CertificatesReport />
            </TabsContent>
            <TabsContent value="study-habits" className="mt-4">
              <StudyHabitsReport />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
