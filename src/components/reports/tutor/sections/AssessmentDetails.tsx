import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentPerformance } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type AssessmentDetailsProps = {
  data: AssessmentPerformance;
};

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AssessmentDetails({ data }: AssessmentDetailsProps) {
  if (!data || data.completedAssessments === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho em Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhuma avaliação encontrada para o período selecionado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho em Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div>
            <p className="font-medium">Média Geral</p>
            <p className="text-2xl font-bold">{data.averageScore.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium">Melhor Nota</p>
            <p className="text-2xl font-bold text-green-600">{data.highestScore.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium">Pior Nota</p>
            <p className="text-2xl font-bold text-red-600">{data.lowestScore.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium">Avaliações Feitas</p>
            <p className="text-2xl font-bold">{data.completedAssessments}</p>
          </div>
        </div>

        <h4 className="font-semibold mb-2">Detalhes das Avaliações</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avaliação</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tentativas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.assessmentDetails.map((assessment) => (
              <TableRow key={assessment.assessmentId}>
                <TableCell>{assessment.assessmentName}</TableCell>
                <TableCell>{assessment.score.toFixed(1)} / {assessment.maxScore}</TableCell>
                <TableCell>{new Date(assessment.completedAt).toLocaleDateString()}</TableCell>
                <TableCell>{assessment.attempts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-semibold mb-2">Pontos Fortes</h4>
            <div className="flex flex-wrap gap-2">
              {data.strengthAreas.length > 0 ? (
                data.strengthAreas.map((area, index) => <Badge key={index} variant="default">{area}</Badge>)
              ) : (
                <p className="text-sm text-gray-500">Nenhum ponto forte identificado.</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Pontos de Melhoria</h4>
            <div className="flex flex-wrap gap-2">
              {data.weaknessAreas.length > 0 ? (
                data.weaknessAreas.map((area, index) => <Badge key={index} variant="destructive">{area}</Badge>)
              ) : (
                <p className="text-sm text-gray-500">Nenhum ponto de melhoria identificado.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
