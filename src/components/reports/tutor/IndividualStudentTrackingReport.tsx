"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateIndividualStudentReportUseCase } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.use-case';
import { GenerateIndividualStudentReportOutput } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';
import { Dropdown, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/select/select";
import { ListClassStudentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-class-students';
import { User } from '@/_core/modules/user/core/entities/User';
import { ReportSymbols } from '@/_core/shared/container/symbols';
import { ReportSummary } from './sections/ReportSummary';
import { StudentDetails } from './sections/StudentDetails';
import { ProgressDetails } from './sections/ProgressDetails';
import { AssessmentDetails } from './sections/AssessmentDetails';
import { EngagementAnalysis } from './sections/EngagementAnalysis';
import { FeedbackSummary } from './sections/FeedbackSummary';
import { ClassComparison } from './sections/ClassComparison';
import { LearningInsights } from './sections/LearningInsights';
import { TutorRecommendations } from './sections/TutorRecommendations';

interface IndividualStudentTrackingReportProps {
  courseId: string | null;
  classId: string | null;
}

export function IndividualStudentTrackingReport({ courseId, classId }: IndividualStudentTrackingReportProps) {
  const { infoUser: user } = useProfile();
  const [report, setReport] = useState<GenerateIndividualStudentReportOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (!user || !classId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      const useCase = container.get<ListClassStudentsUseCase>(ListClassStudentsUseCase);
      const result = await useCase.execute({ classId, institutionId: user.currentIdInstitution });
      console.log({ students: result.students }); // Debugging line
      setStudents(result.students);
    };

    fetchStudents();
  }, [user, classId]);

  useEffect(() => {
    if (!user || !selectedStudent || !courseId || !classId) {
      setReport(null);
      return;
    };

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const useCase = container.get<GenerateIndividualStudentReportUseCase>(ReportSymbols.useCases.GenerateIndividualStudentTrackingReportUseCase);
        const result = await useCase.execute({
          tutorId: user.id,
          institutionId: user.currentIdInstitution,
          studentId: selectedStudent,
          courseId,
          classId,
          includeProgressDetails: true,
          includeAssessments: true,
          includeEngagement: true,
          includeFeedbackHistory: true,
          includeClassComparison: true,
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
  }, [user, selectedStudent, courseId, classId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acompanhamento Individual do Aluno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dropdown className="w-[280px]">
            <button className="w-full border rounded-md p-2 text-left">
              {selectedStudent ? students.find(s => s.id === selectedStudent)?.name : "Selecione um aluno"}
            </button>
            <DropdownMenuContent>
              {students.map((student) => (
                <DropdownMenuItem key={student.id} onSelect={() => setSelectedStudent(student.id)}>
                  {student.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </Dropdown>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && !report && <p>Selecione um aluno para ver o relatório.</p>}
        
        {report && (
          <div className="space-y-6">
            {report.summary && <ReportSummary data={report.summary} />}
            {report.studentInfo && <StudentDetails data={report.studentInfo} />}
            {report.recommendations && <TutorRecommendations data={report.recommendations} />}
            {report.progressDetails && <ProgressDetails data={report.progressDetails} />}
            {report.assessmentPerformance && <AssessmentDetails data={report.assessmentPerformance} />}
            {report.engagementMetrics && <EngagementAnalysis data={report.engagementMetrics} />}
            {report.classComparison && <ClassComparison data={report.classComparison} />}
            {report.learningAnalytics && <LearningInsights data={report.learningAnalytics} />}
            {report.feedbackHistory && <FeedbackSummary data={report.feedbackHistory} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
