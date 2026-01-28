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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { container } from '@/_core/shared/container';
import { ListClassesUseCase } from '@/_core/modules/enrollment/core/use-cases/list-classes/list-classes.use-case';
import { ListTrailsUseCase } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.use-case';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { GenerateCourseDashboardReportUseCase } from '@/_core/modules/report/core/use-cases/generate-course-dashboard-report/generate-course-dashboard-report.use-case';
import { GenerateCourseDashboardReportOutput } from '@/_core/modules/report/core/use-cases/generate-course-dashboard-report/generate-course-dashboard-report.output';
import { useProfile } from '@/context/zustand/useProfile';
import { Class } from '@/_core/modules/enrollment/core/entities/Class';
import { Trail } from '@/_core/modules/content/core/entities/Trail';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { Register, ReportSymbols } from '@/_core/shared/container/symbols';
import { LoadingSpinner } from '@/components/loader';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CACHE_DURATION = 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const trailsCache: Map<string, CacheEntry<Trail[]>> = new Map();
const classesCache: Map<string, CacheEntry<Class[]>> = new Map();
const coursesCache: Map<string, CacheEntry<Course[]>> = new Map();
const dashboardCache: Map<string, CacheEntry<GenerateCourseDashboardReportOutput>> = new Map();

export default function AdminReports() {
  const { infoUser: user } = useProfile();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardReport, setDashboardReport] = useState<GenerateCourseDashboardReportOutput | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);

  const fetchTrails = useCallback(async () => {
    if (!user?.currentIdInstitution) return;

    const cacheKey = `trails_${user.currentIdInstitution}`;
    const cached = trailsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTrails(cached.data);
      return;
    }

    try {
      const listTrailsUseCase = container.get<ListTrailsUseCase>(Register.content.useCase.ListTrailsUseCase);
      const result = await listTrailsUseCase.execute({ institutionId: user.currentIdInstitution });

      trailsCache.set(cacheKey, {
        data: result.trails,
        timestamp: Date.now()
      });

      setTrails(result.trails);
    } catch (error) {
      console.error('Error fetching trails:', error);
    }
  }, [user?.currentIdInstitution]);

  const fetchClasses = useCallback(async () => {
    if (!user?.currentIdInstitution) return;

    const cacheKey = `classes_${user.currentIdInstitution}`;
    const cached = classesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setClasses(cached.data);
      return;
    }

    try {
      const listClassesUseCase = container.get<ListClassesUseCase>(Register.enrollment.useCase.ListClassesUseCase);
      const result = await listClassesUseCase.execute({ institutionId: user.currentIdInstitution });

      classesCache.set(cacheKey, {
        data: result.classes,
        timestamp: Date.now()
      });

      setClasses(result.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [user?.currentIdInstitution]);

  const fetchCourses = useCallback(async () => {
    if (!user?.currentIdInstitution) return;

    const cacheKey = `courses_${user.currentIdInstitution}`;
    const cached = coursesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCourses(cached.data);
      return;
    }

    try {
      const courseRepository = container.get<CourseRepository>(Register.content.repository.CourseRepository);
      const result = await courseRepository.listByInstitution(user.currentIdInstitution);

      coursesCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setCourses(result);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [user?.currentIdInstitution]);

  const fetchDashboardReport = useCallback(async () => {
    if (!user?.currentIdInstitution) return;

    const cacheKey = `dashboard_${user.currentIdInstitution}_${selectedCourse || 'all'}`;
    const cached = dashboardCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setDashboardReport(cached.data);
      return;
    }

    try {
      setDashboardLoading(true);
      const useCase = container.get<GenerateCourseDashboardReportUseCase>(
        ReportSymbols.useCases.GenerateCourseDashboardReportUseCase
      );

      const result = await useCase.execute({
        adminId: user.id,
        institutionId: user.currentIdInstitution,
        courseId: selectedCourse || undefined,
        includeEnrollmentTrends: true,
        includePerformanceMetrics: true,
        includeComparativeAnalysis: true,
      });

      dashboardCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setDashboardReport(result);
    } catch (error) {
      console.error('Error fetching dashboard report:', error);
    } finally {
      setDashboardLoading(false);
    }
  }, [user?.currentIdInstitution, user?.id, selectedCourse]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTrails(), fetchClasses(), fetchCourses()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTrails, fetchClasses, fetchCourses]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardReport();
    }
  }, [activeTab, fetchDashboardReport]);

  const handleTrailSelect = useCallback((trailId: string | null) => {
    setSelectedTrail(trailId);
    setSelectedClass(null);
    setSelectedCourse(null);

    if (trailId) {
      const trail = trails.find(t => t.id === trailId);
      if (trail && trail.courseIds.length > 0) {
        setSelectedCourse(trail.courseIds[0]);
      }
    }
  }, [trails]);

  const handleClassSelect = useCallback((classId: string | null) => {
    setSelectedClass(classId);

    if (classId) {
      const cls = classes.find(c => c.id === classId);
      if (cls?.courseId) {
        setSelectedCourse(cls.courseId);
      }
      if (cls?.trailId) {
        setSelectedTrail(cls.trailId);
      }
    }
  }, [classes]);

  const handleCourseSelect = useCallback((courseId: string | null) => {
    setSelectedCourse(courseId);
  }, []);

  const filteredClasses = useMemo(() => {
    if (!selectedTrail) return classes;
    return classes.filter(c => c.trailId === selectedTrail);
  }, [classes, selectedTrail]);

  const filteredCourses = useMemo(() => {
    if (!selectedTrail) return courses;
    const trail = trails.find(t => t.id === selectedTrail);
    if (!trail) return courses;
    return courses.filter(c => trail.courseIds.includes(c.id));
  }, [courses, trails, selectedTrail]);

  const selectedTrailName = useMemo(() => {
    if (!selectedTrail) return "Todas as Trilhas";
    return trails.find(t => t.id === selectedTrail)?.title || "Todas as Trilhas";
  }, [selectedTrail, trails]);

  const selectedClassName = useMemo(() => {
    if (!selectedClass) return "Todas as Turmas";
    return classes.find(c => c.id === selectedClass)?.name || "Todas as Turmas";
  }, [selectedClass, classes]);

  const selectedCourseName = useMemo(() => {
    if (!selectedCourse) return "Todos os Cursos";
    return courses.find(c => c.id === selectedCourse)?.title || "Todos os Cursos";
  }, [selectedCourse, courses]);

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
          <h1 className="text-2xl font-bold">Relatórios da Instituição</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho geral, progresso e engajamento da sua instituição.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 my-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-between">
                <span className="truncate">{selectedTrailName}</span>
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
              <DropdownMenuItem onSelect={() => handleTrailSelect(null)}>
                Todas as Trilhas
              </DropdownMenuItem>
              {trails.map((trail) => (
                <DropdownMenuItem key={trail.id} onSelect={() => handleTrailSelect(trail.id)}>
                  {trail.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-between">
                <span className="truncate">{selectedClassName}</span>
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
              <DropdownMenuItem onSelect={() => handleClassSelect(null)}>
                Todas as Turmas
              </DropdownMenuItem>
              {filteredClasses.map((cls) => (
                <DropdownMenuItem key={cls.id} onSelect={() => handleClassSelect(cls.id)}>
                  {cls.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-between">
                <span className="truncate">{selectedCourseName}</span>
                <span>▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
              <DropdownMenuItem onSelect={() => handleCourseSelect(null)}>
                Todos os Cursos
              </DropdownMenuItem>
              {filteredCourses.map((course) => (
                <DropdownMenuItem key={course.id} onSelect={() => handleCourseSelect(course.id)}>
                  {course.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="class-overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="assessment-performance">Avaliações</TabsTrigger>
                <TabsTrigger value="engagement-retention">Engajamento</TabsTrigger>
                <TabsTrigger value="individual-tracking">Individual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-4">
            {activeTab === 'dashboard' && (
              <DashboardTab
                report={dashboardReport}
                loading={dashboardLoading}
              />
            )}
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
  );
}

interface DashboardTabProps {
  report: GenerateCourseDashboardReportOutput | null;
  loading: boolean;
}

function DashboardTab({ report, loading }: DashboardTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!report) {
    return <div>Nenhum dado disponível.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.courseOverview.totalCourses}</p>
            <p className="text-xs text-muted-foreground">
              {report.courseOverview.activeCourses} ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Matrículas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.courseOverview.totalEnrollments}</p>
            <p className="text-xs text-muted-foreground">
              Média: {report.courseOverview.averageEnrollmentsPerCourse.toFixed(1)} por curso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {report.insights?.keyMetrics.overallCompletionRate.toFixed(1)}%
            </p>
            <Progress value={report.insights?.keyMetrics.overallCompletionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alunos Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.insights?.keyMetrics.totalStudentsServed}</p>
            <p className="text-xs text-muted-foreground">
              Satisfação: {report.insights?.keyMetrics.averageStudentSatisfaction.toFixed(1)}/5
            </p>
          </CardContent>
        </Card>
      </div>

      {report.courseMetrics && report.courseMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Matrículas</TableHead>
                  <TableHead>Ativos</TableHead>
                  <TableHead>Concluídos</TableHead>
                  <TableHead>Taxa de Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.courseMetrics.map((course) => (
                  <TableRow key={course.courseId}>
                    <TableCell className="font-medium">{course.courseName}</TableCell>
                    <TableCell>{course.totalEnrollments}</TableCell>
                    <TableCell>{course.activeEnrollments}</TableCell>
                    <TableCell>{course.completedEnrollments}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{course.completionRate.toFixed(1)}%</span>
                        <Progress value={course.completionRate} className="w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {report.performanceMetrics && report.performanceMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead>Taxa de Aprovação</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.performanceMetrics.map((perf) => (
                  <TableRow key={perf.courseId}>
                    <TableCell className="font-medium">{perf.courseName}</TableCell>
                    <TableCell>{perf.averageScore}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{perf.passRate}%</span>
                        <Progress value={perf.passRate} className="w-20" />
                      </div>
                    </TableCell>
                    <TableCell>{perf.difficultyRating}</TableCell>
                    <TableCell>{perf.improvementTrend}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {report.insights?.actionableInsights && report.insights.actionableInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.insights.actionableInsights.map((insight, index) => (
                <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.priority}
                    </span>
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.recommendedActions && insight.recommendedActions.length > 0 && (
                    <ul className="text-sm list-disc list-inside">
                      {insight.recommendedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.comparativeAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Comparativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Período Atual</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Matrículas:</span>
                    <span className="font-medium">{report.comparativeAnalysis.currentPeriod.totalEnrollments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Conclusão:</span>
                    <span className="font-medium">{report.comparativeAnalysis.currentPeriod.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média:</span>
                    <span className="font-medium">{report.comparativeAnalysis.currentPeriod.averageScore}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mudanças</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Matrículas:</span>
                    <span className={`font-medium ${report.comparativeAnalysis.changes.enrollmentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.comparativeAnalysis.changes.enrollmentChange >= 0 ? '+' : ''}{report.comparativeAnalysis.changes.enrollmentChange}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Conclusão:</span>
                    <span className={`font-medium ${report.comparativeAnalysis.changes.completionRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.comparativeAnalysis.changes.completionRateChange >= 0 ? '+' : ''}{report.comparativeAnalysis.changes.completionRateChange}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média:</span>
                    <span className={`font-medium ${report.comparativeAnalysis.changes.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.comparativeAnalysis.changes.scoreChange >= 0 ? '+' : ''}{report.comparativeAnalysis.changes.scoreChange}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
