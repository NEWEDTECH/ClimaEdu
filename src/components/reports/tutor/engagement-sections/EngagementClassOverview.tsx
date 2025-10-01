import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassEngagementOverview } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementClassOverviewProps = {
  data: ClassEngagementOverview;
};

import { Progress } from '@/components/ui/progress';

export function EngagementClassOverview({ data }: EngagementClassOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral da Turma</CardTitle>
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
            <p className="font-medium">Alunos Inativos</p>
            <p className="text-2xl font-bold text-red-600">{data.inactiveStudents}</p>
          </div>
          <div>
            <p className="font-medium">Saúde da Turma</p>
            <p className="text-2xl font-bold">{data.classHealthScore}%</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Distribuição de Engajamento</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Alto</span>
              <span>{data.engagementDistribution.high}</span>
            </div>
            <Progress value={(data.engagementDistribution.high / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Médio</span>
              <span>{data.engagementDistribution.medium}</span>
            </div>
            <Progress value={(data.engagementDistribution.medium / data.totalStudents) * 100} />
            <div className="flex justify-between">
              <span>Baixo</span>
              <span>{data.engagementDistribution.low}</span>
            </div>
            <Progress value={(data.engagementDistribution.low / data.totalStudents) * 100} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">Principais Insights</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              {data.keyInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-600 mb-2">Áreas de Preocupação</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {data.concernAreas.map((concern, index) => (
                <li key={index}>{concern}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
