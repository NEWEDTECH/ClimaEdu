"use client";

import React, { useEffect, useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/context/zustand/useProfile';
import { GenerateStudentBadgesReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-badges-report';
import { GenerateStudentBadgesReportOutput, BadgeData } from '@/_core/modules/report/core/use-cases/generate-student-badges-report/generate-student-badges-report.output';

export const BadgesReport = () => {
  const [reportData, setReportData] = useState<GenerateStudentBadgesReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { infoUser } = useProfile();

  useEffect(() => {
    if (!infoUser.id) return;

    const fetchReport = async () => {
      const generateReport = container.get<GenerateStudentBadgesReportUseCase>(
        Register.report.useCase.GenerateStudentBadgesReportUseCase
      );

      setLoading(true);
      setError(null);
      try {
        const data = await generateReport.execute({
          userId: infoUser.id,
          institutionId: infoUser.currentIdInstitution,
          includeProgress: true,
        });
        setReportData(data);
      } catch (err) {
        setError('Falha ao carregar o relatório de badges.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [infoUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando relatório...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao Carregar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData || reportData.badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não há badges para exibir no momento.</p>
        </CardContent>
      </Card>
    );
  }

  const { overallStats, badges } = reportData;
  const earnedBadges = badges.filter(b => b.isEarned);
  const inProgressBadges = badges.filter(b => !b.isEarned && b.progressPercentage > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Badges e Conquistas</CardTitle>
          <CardDescription>Sua jornada de gamificação na plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Badges Conquistadas</p>
            <p className="text-2xl font-bold">{overallStats.earnedBadges}/{overallStats.totalBadges}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Pontos Totais</p>
            <p className="text-2xl font-bold">{overallStats.totalPoints}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Nível Atual</p>
            <p className="text-2xl font-bold">{overallStats.currentLevel}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Badges Raras</p>
            <p className="text-2xl font-bold">{overallStats.raresBadgesEarned}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Badges Conquistadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {earnedBadges.map((badge: BadgeData) => (
                <AccordionItem value={badge.badgeId} key={badge.badgeId}>
                  <AccordionTrigger>{badge.badgeName}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{badge.badgeDescription}</p>
                    <p className="text-xs mt-2">Conquistada em: {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'N/A'}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {inProgressBadges.map((badge: BadgeData) => (
                <AccordionItem value={badge.badgeId} key={badge.badgeId}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{badge.badgeName}</span>
                      <span className="font-mono text-sm">{badge.progressPercentage.toFixed(0)}%</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{badge.badgeDescription}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
