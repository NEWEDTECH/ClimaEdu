import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EngagementMetrics } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type EngagementAnalysisProps = {
  data: EngagementMetrics;
};

import { Badge } from '@/components/ui/badge';

export function EngagementAnalysis({ data }: EngagementAnalysisProps) {
  if (!data) {
    return null;
  }

  const getRiskVariant = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (level) {
      case 'LOW':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'HIGH':
        return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Engajamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-medium">Nível de Participação</p>
            <Badge variant={getRiskVariant(data.participationLevel)}>{data.participationLevel}</Badge>
          </div>
          <div>
            <p className="font-medium">Risco de Evasão</p>
            <Badge variant={getRiskVariant(data.riskLevel)}>{data.riskLevel}</Badge>
          </div>
          <div>
            <p className="font-medium">Sequência de Estudos</p>
            <p className="text-lg font-bold">{data.studyPatterns.studyStreak.current} dias</p>
          </div>
          <div>
            <p className="font-medium">Sessão Mais Longa</p>
            <p className="text-lg font-bold">{(data.studyPatterns.longestSession / 60).toFixed(1)} min</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Frequência de Login</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <p>Média Diária: {data.loginFrequency.dailyAverage.toFixed(2)}</p>
            <p>Média Semanal: {data.loginFrequency.weeklyAverage.toFixed(2)}</p>
            <p>Média Mensal: {data.loginFrequency.monthlyAverage.toFixed(2)}</p>
            <p>Última Semana: {data.loginFrequency.lastWeekLogins}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Interação com Conteúdo</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <p>Vídeos: {data.contentInteraction.videosWatched}</p>
            <p>Documentos: {data.contentInteraction.documentsRead}</p>
            <p>Quizzes: {data.contentInteraction.quizzesCompleted}</p>
            <p>Posts no Fórum: {data.contentInteraction.forumPosts}</p>
            <p>Perguntas Feitas: {data.contentInteraction.questionsAsked}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
