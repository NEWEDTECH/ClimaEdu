import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateClassAssessmentPerformanceReportOutput } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report/generate-class-assessment-performance-report.output';

type AssessmentInsightsProps = {
  data: GenerateClassAssessmentPerformanceReportOutput['insights'];
};

export function AssessmentInsights({ data }: AssessmentInsightsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Alunos em Destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.topPerformers.map(student => (
              <li key={student.studentId} className="flex justify-between">
                <span>{student.studentName}</span>
                <span className="font-semibold">{student.averageScore.toFixed(2)}%</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alunos que Precisam de Atenção</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.strugglingStudents.map(student => (
              <li key={student.studentId} className="flex justify-between">
                <span>{student.studentName}</span>
                <span className="font-semibold">{student.averageScore.toFixed(2)}%</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
