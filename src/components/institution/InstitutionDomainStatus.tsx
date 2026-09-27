'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button';
import {
  fetchInstitutionDomainStatus,
  syncInstitutionDomain,
  type VercelDomainStatus,
} from './institution-domain.api';

type Props = {
  institutionId: string;
};

function getBadge(status: VercelDomainStatus) {
  if (!status.registered) return { label: 'Não registrado', className: 'bg-gray-100 text-gray-700' };
  if (!status.verified) return { label: 'Aguardando verificação', className: 'bg-yellow-100 text-yellow-800' };
  if (!status.configured) return { label: 'DNS pendente', className: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Ativo', className: 'bg-green-100 text-green-800' };
}

/** Vercel/DNS status of an institution domain, with the DNS records to configure */
export function InstitutionDomainStatus({ institutionId }: Props) {
  const [status, setStatus] = useState<VercelDomainStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const run = useCallback(async (action: () => Promise<VercelDomainStatus>) => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar domínio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run(() => fetchInstitutionDomainStatus(institutionId));
  }, [institutionId, run]);

  if (loading) {
    return <span className="text-xs text-gray-500">Verificando...</span>;
  }

  if (error || !status) {
    return (
      <span className="text-xs text-red-600" title={error ?? undefined}>
        Erro ao consultar
      </span>
    );
  }

  const badge = getBadge(status);
  const isActive = status.registered && status.verified && status.configured;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
        {!isActive && (
          <button
            type="button"
            className="text-xs underline text-gray-600 dark:text-gray-400"
            onClick={() => setExpanded(prev => !prev)}
          >
            {expanded ? 'Ocultar' : 'Detalhes'}
          </button>
        )}
      </div>

      {expanded && !isActive && (
        <div className="rounded border p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
          {!status.registered ? (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                O domínio ainda não foi registrado no projeto da Vercel.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={() => run(() => syncInstitutionDomain(institutionId))}
              >
                Registrar na Vercel
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Peça para a instituição criar estes registros no provedor de DNS:
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left">
                    <th className="pr-2">Tipo</th>
                    <th className="pr-2">Nome</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {status.dnsRecords.map(record => (
                    <tr key={`${record.type}-${record.name}-${record.value}`}>
                      <td className="pr-2 font-mono">{record.type}</td>
                      <td className="pr-2 font-mono break-all">{record.name}</td>
                      <td className="font-mono break-all">{record.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                type="button"
                variant="secondary"
                onClick={() => run(() => fetchInstitutionDomainStatus(institutionId))}
              >
                Verificar novamente
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
