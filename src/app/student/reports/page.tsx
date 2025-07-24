"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentPerformanceReport } from '@/components/reports/student/AssessmentPerformanceReport';

// Placeholder components for other report tabs
const CourseProgressReport = () => <Card><CardHeader><CardTitle>Progresso nos Cursos</CardTitle><CardDescription>Seu avanço em cada curso.</CardDescription></CardHeader><CardContent><p>Em breve.</p></CardContent></Card>;
const BadgesReport = () => <Card><CardHeader><CardTitle>Badges e Conquistas</CardTitle><CardDescription>Suas medalhas e reconhecimentos.</CardDescription></CardHeader><CardContent><p>Em breve.</p></CardContent></Card>;
const CertificatesReport = () => <Card><CardHeader><CardTitle>Certificados</CardTitle><CardDescription>Seus certificados obtidos e em andamento.</CardDescription></CardHeader><CardContent><p>Em breve.</p></CardContent></Card>;
const StudyHabitsReport = () => <Card><CardHeader><CardTitle>Hábitos de Estudo</CardTitle><CardDescription>Análise dos seus padrões de estudo.</CardDescription></CardHeader><CardContent><p>Em breve.</p></CardContent></Card>;

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
