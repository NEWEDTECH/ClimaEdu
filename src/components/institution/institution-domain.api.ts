'use client';

import { auth } from '@/_core/shared/firebase/firebase-client';
import type { VercelDomainStatus } from '@/_core/shared/vercel/vercel-domains';

export type { VercelDomainStatus, DnsRecord } from '@/_core/shared/vercel/vercel-domains';

const ENDPOINT = '/api/admin/institution-domain';

async function request(input: string, init?: RequestInit): Promise<VercelDomainStatus> {
  // Em carregamento direto da página, a sessão do Firebase pode ainda não ter sido restaurada
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao consultar o domínio da instituição');
  }
  return data as VercelDomainStatus;
}

export function fetchInstitutionDomainStatus(institutionId: string) {
  return request(`${ENDPOINT}?institutionId=${encodeURIComponent(institutionId)}`);
}

/** Registers the saved institution domain in Vercel (and removes the previous one, if changed) */
export function syncInstitutionDomain(institutionId: string, previousDomain?: string) {
  return request(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ institutionId, previousDomain }),
  });
}
