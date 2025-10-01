import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterventionRecommendations } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report/generate-engagement-retention-report.output';

type EngagementRecommendationsProps = {
  data: InterventionRecommendations;
};

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function EngagementRecommendations({ data }: EngagementRecommendationsProps) {
  if (!data) {
    return null;
  }

  const getPriorityVariant = (priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendações e Intervenções</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.immediateActions.length > 0 && (
          <div>
            <h4 className="font-bold text-lg mb-2 text-red-700">Ações Imediatas</h4>
            <div className="space-y-3">
              {data.immediateActions.map((action, index) => (
                <div key={index} className="p-3 bg-red-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{action.action}</p>
                    <Badge variant={getPriorityVariant(action.priority)}>{action.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{action.reason}</p>
                  <p className="text-sm font-medium">Alunos: {action.studentIds.length}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Estratégias Preventivas</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estratégia</TableHead>
                <TableHead>Grupo Alvo</TableHead>
                <TableHead>Impacto Esperado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.preventiveStrategies.map((strategy, index) => (
                <TableRow key={index}>
                  <TableCell>{strategy.strategy}</TableCell>
                  <TableCell>{strategy.targetGroup}</TableCell>
                  <TableCell>{strategy.expectedImpact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
