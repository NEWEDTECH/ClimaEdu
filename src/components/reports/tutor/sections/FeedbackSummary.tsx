import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackHistory } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type FeedbackSummaryProps = {
  data: FeedbackHistory;
};

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function FeedbackSummary({ data }: FeedbackSummaryProps) {
  if (!data || data.totalFeedbacks === 0) {
    return null; // Don't render the card if there's no feedback
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Feedbacks Recebidos</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.feedbackDetails.map((feedback) => (
                <TableRow key={feedback.feedbackId}>
                  <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{feedback.createdBy}</TableCell>
                  <TableCell>{feedback.type.replace('_', ' ')}</TableCell>
                  <TableCell>{feedback.content}</TableCell>
                  <TableCell>{feedback.rating ?? 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.improvementActions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Ações de Melhoria</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Prazo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.improvementActions.map((action) => (
                  <TableRow key={action.actionId}>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.status}</TableCell>
                    <TableCell>{new Date(action.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
