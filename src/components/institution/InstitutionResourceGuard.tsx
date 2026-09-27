'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInstitutionScope } from '@/hooks/useInstitutionScope';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { LoadingSpinner } from '@/components/loader';
import { Button } from '@/components/button';

type Props = {
  /**
   * Retorna as instituições às quais o registro pertence
   * (ex.: [curso.institutionId], ou as instituições de um usuário).
   * Retornar null quando o registro não existe deixa a própria página tratar o "não encontrado".
   */
  resolveInstitutionIds: () => Promise<string[] | null>;
  /** Identifica o registro; ao mudar, a verificação é refeita */
  resourceKey: string;
  /** Para onde o botão "Voltar" leva */
  backHref: string;
  /** Mensagem exibida quando o acesso é negado */
  deniedMessage?: string;
  children: React.ReactNode;
};

type GuardState = 'checking' | 'allowed' | 'denied';

/**
 * Bloqueia telas abertas pelo ID na URL quando o registro é de outra instituição.
 * SUPER_ADMIN e SYSTEM_ADMIN não são bloqueados.
 */
export function InstitutionResourceGuard({
  resolveInstitutionIds,
  resourceKey,
  backHref,
  deniedMessage = 'Este registro pertence a outra instituição.',
  children,
}: Props) {
  const { isReady, isGlobalAdmin, canAccessInstitution } = useInstitutionScope();
  const [state, setState] = useState<GuardState>('checking');

  useEffect(() => {
    // Sem papel carregado (ex.: deslogado), a própria página cuida do login
    if (!isReady || isGlobalAdmin) {
      setState('allowed');
      return;
    }

    let cancelled = false;
    setState('checking');

    resolveInstitutionIds()
      .then(ids => {
        if (cancelled) return;
        setState(ids === null || ids.some(canAccessInstitution) ? 'allowed' : 'denied');
      })
      .catch(error => {
        console.error('Erro ao verificar a instituição do registro:', error);
        if (!cancelled) setState('denied');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, isReady, isGlobalAdmin, canAccessInstitution]);

  if (state === 'allowed') return <>{children}</>;

  return (
    <ProtectedContent>
      <DashboardLayout>
        {state === 'checking' ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="container mx-auto p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <strong className="font-bold">Acesso negado.</strong>
              <span className="block sm:inline"> {deniedMessage}</span>
            </div>
            <Link href={backHref} className="inline-block mt-4">
              <Button variant="primary">Voltar</Button>
            </Link>
          </div>
        )}
      </DashboardLayout>
    </ProtectedContent>
  );
}
