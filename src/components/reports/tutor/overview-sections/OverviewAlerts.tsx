import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorAlert } from '@/_core/modules/report/core/use-cases/generate-class-overview-report/generate-class-overview-report.output';

type OverviewAlertsProps = {
  data: TutorAlert[];
};

import { Badge } from '@/components/ui/badge';

export function OverviewAlerts({ data }: OverviewAlertsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const getSeverityVariant = (severity: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (severity) {
      case 'URGENT':
        return 'destructive';
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
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((alert) => (
          <div key={alert.alertId} className="p-3 border rounded-lg">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{alert.title}</p>
              <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge>
            </div>
            <p className="text-sm text-gray-600">{alert.description}</p>
            <p className="text-sm">Ações Sugeridas: {alert.suggestedActions.join(', ')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
