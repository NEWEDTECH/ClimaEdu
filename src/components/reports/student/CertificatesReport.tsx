"use client";

import React, { useEffect, useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/context/zustand/useProfile';
import { GenerateStudentCertificatesReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-certificates-report';
import { GenerateStudentCertificatesReportOutput } from '@/_core/modules/report/core/use-cases/generate-student-certificates-report/generate-student-certificates-report.output';

export const CertificatesReport = () => {
  const [reportData, setReportData] = useState<GenerateStudentCertificatesReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { infoUser } = useProfile();

  useEffect(() => {
    if (!infoUser.id) return;

    const fetchReport = async () => {
      const generateReport = container.get<GenerateStudentCertificatesReportUseCase>(
        Register.report.useCase.GenerateStudentCertificatesReportUseCase
      );

      setLoading(true);
      setError(null);
      try {
        const data = await generateReport.execute({
          userId: infoUser.id,
          institutionId: infoUser.currentIdInstitution,
        });
        setReportData(data);
      } catch (err) {
        setError('Falha ao carregar o relatório de certificados.');
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

  if (!reportData || reportData.certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não há certificados para exibir no momento.</p>
        </CardContent>
      </Card>
    );
  }

  const { summary } = reportData;

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Certificados</CardTitle>
          <CardDescription>Suas conquistas e certificações oficiais.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Total de Certificados</p>
            <p className="text-2xl font-bold">{summary.totalCertificates}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Neste Ano</p>
            <p className="text-2xl font-bold">{summary.certificatesThisYear}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Neste Mês</p>
            <p className="text-2xl font-bold">{summary.certificatesThisMonth}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-2xl font-bold">{summary.averageTimeToComplete.toFixed(0)} dias</p>
          </div>
        </CardContent>
      </Card>
      {/* A lista detalhada de certificados seria implementada aqui */}
    </div>
  );
};
