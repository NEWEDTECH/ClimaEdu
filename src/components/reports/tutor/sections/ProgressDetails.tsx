import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailedProgress } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type ProgressDetailsProps = {
  data: DetailedProgress[];
};

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ProgressDetails({ data }: ProgressDetailsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhum progresso encontrado para o período selecionado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso Detalhado</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {data.map((courseProgress) => (
            <AccordionItem value={courseProgress.courseId} key={courseProgress.courseId}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span>{courseProgress.courseName}</span>
                  <span className="text-right">{courseProgress.overallProgress.toFixed(0)}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Lições Concluídas</p>
                      <p>{courseProgress.lessonsCompleted} / {courseProgress.totalLessons}</p>
                    </div>
                    <div>
                      <p className="font-medium">Módulos Concluídos</p>
                      <p>{courseProgress.modulesCompleted} / {courseProgress.totalModules}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tempo Gasto</p>
                      <p>{(courseProgress.timeSpent / 60).toFixed(2)} horas</p>
                    </div>
                    <div>
                      <p className="font-medium">Última Atividade</p>
                      <p>{new Date(courseProgress.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold">Progresso por Módulo</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Módulo</TableHead>
                        <TableHead className="w-[150px]">Progresso</TableHead>
                        <TableHead>Lições</TableHead>
                        <TableHead>Tempo Gasto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseProgress.progressByModule.map((module) => (
                        <TableRow key={module.moduleId}>
                          <TableCell>{module.moduleName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{module.progress.toFixed(0)}%</span>
                              <Progress value={module.progress} />
                            </div>
                          </TableCell>
                          <TableCell>{module.lessonsCompleted} / {module.totalLessons}</TableCell>
                          <TableCell>{(module.timeSpent / 60).toFixed(2)} min</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
