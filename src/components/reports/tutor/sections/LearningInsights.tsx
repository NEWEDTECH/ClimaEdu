import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningAnalytics } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type LearningInsightsProps = {
  data: LearningAnalytics;
};

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function LearningInsights({ data }: LearningInsightsProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights de Aprendizagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Estilo de Aprendizagem</p>
            <Badge>{data.learningStyle}</Badge>
          </div>
          <div>
            <p className="font-medium">Velocidade de Aprendizagem</p>
            <p>{data.learningVelocity} lições/semana</p>
          </div>
          <div>
            <p className="font-medium">Taxa de Retenção</p>
            <p>{data.retentionRate}%</p>
          </div>
          <div>
            <p className="font-medium">Melhor Horário</p>
            <p>{data.optimalStudyTime}:00 - {data.optimalStudyTime + 1}:00</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Conteúdos Preferidos</h4>
          <div className="flex flex-wrap gap-2">
            {data.preferredContentTypes.map((type, index) => (
              <Badge key={index} variant="secondary">{type}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Maestria de Conceitos</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conceito</TableHead>
                <TableHead>Nível de Maestria</TableHead>
                <TableHead>Áreas de Dificuldade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.conceptMastery.map((concept, index) => (
                <TableRow key={index}>
                  <TableCell>{concept.concept}</TableCell>
                  <TableCell>{concept.masteryLevel}%</TableCell>
                  <TableCell>{concept.strugglingAreas.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
