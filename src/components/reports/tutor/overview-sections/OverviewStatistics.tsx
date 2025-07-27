import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassStatistics } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewStatisticsProps = {
  data: ClassStatistics;
};

import { Progress } from '@/components/ui/progress';

export function OverviewStatistics({ data }: OverviewStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas da Turma</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-medium">Total de Alunos</p>
            <p className="text-2xl font-bold">{data.totalStudents}</p>
          </div>
          <div>
            <p className="font-medium">Alunos Ativos</p>
            <p className="text-2xl font-bold text-green-600">{data.activeStudents}</p>
          </div>
          <div>
            <p className="font-medium">Progresso Médio</p>
            <p className="text-2xl font-bold">{data.averageProgress.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium">Média da Turma</p>
            <p className="text-2xl font-bold">{data.classAverageScore.toFixed(1)}%</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Distribuição de Progresso</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Não Iniciado</span>
              <span>{data.progressDistribution.notStarted}</span>
            </div>
            <Progress value={(data.progressDistribution.notStarted / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Iniciante</span>
              <span>{data.progressDistribution.beginner}</span>
            </div>
            <Progress value={(data.progressDistribution.beginner / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Intermediário</span>
              <span>{data.progressDistribution.intermediate}</span>
            </div>
            <Progress value={(data.progressDistribution.intermediate / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Avançado</span>
              <span>{data.progressDistribution.advanced}</span>
            </div>
            <Progress value={(data.progressDistribution.advanced / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Concluído</span>
              <span>{data.progressDistribution.completed}</span>
            </div>
            <Progress value={(data.progressDistribution.completed / data.totalStudents) * 100} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
