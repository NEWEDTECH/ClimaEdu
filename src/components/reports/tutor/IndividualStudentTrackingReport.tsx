"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { GenerateIndividualStudentReportUseCase } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.use-case';
import { GenerateIndividualStudentReportOutput } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';
import { Dropdown, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/select/select";
import { Progress } from '@/components/ui/progress';
import { ListClassStudentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-class-students';
import { User } from '@/_core/modules/user/core/entities/User';
import { ReportSymbols } from '@/_core/shared/container/symbols';

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
          includeProgressDetails: true,
          includeAssessments: true,
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
            <Card>
              <CardHeader>
                <CardTitle>{report.studentInfo.studentName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Email: {report.studentInfo.email}</p>
                <p>Matriculado em: {new Date(report.studentInfo.enrollmentDate).toLocaleDateString()}</p>
                <p>Status: {report.studentInfo.status}</p>
              </CardContent>
            </Card>

            {report.progressDetails?.map(progress => (
              <Card key={progress.courseId}>
                <CardHeader>
                  <CardTitle>Progresso em {progress.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span>Progresso Geral: {progress.overallProgress.toFixed(2)}%</span>
                    <Progress value={progress.overallProgress} className="w-full" />
                  </div>
                  <p>Lições Concluídas: {progress.lessonsCompleted}/{progress.totalLessons}</p>
                  <p>Tempo Gasto: {(progress.timeSpent / 60).toFixed(2)} horas</p>
                </CardContent>
              </Card>
            ))}

            {report.assessmentPerformance && (
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho em Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Média: {report.assessmentPerformance.averageScore.toFixed(2)}%</p>
                  <p>Melhor Nota: {report.assessmentPerformance.highestScore.toFixed(2)}%</p>
                  <p>Pior Nota: {report.assessmentPerformance.lowestScore.toFixed(2)}%</p>
                  <p>Tendência: {report.assessmentPerformance.improvementTrend}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
