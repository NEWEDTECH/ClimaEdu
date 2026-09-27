/**
 * Vercel Domains API client (server-only).
 * Registers institution domains in the Vercel project so they can serve the app.
 *
 * Required env vars: VERCEL_API_TOKEN, VERCEL_PROJECT_ID
 * Optional: VERCEL_TEAM_ID (when the project belongs to a team)
 */

const VERCEL_API = 'https://api.vercel.com';

/** Vercel defaults, used when the API does not return project-specific recommendations */
const DEFAULT_A_RECORD = '76.76.21.21';
const DEFAULT_CNAME = 'cname.vercel-dns.com';

/** Two-level public suffixes common for our customers (apex detection) */
const TWO_LEVEL_SUFFIXES = ['com.br', 'edu.br', 'org.br', 'gov.br', 'net.br', 'art.br', 'ind.br', 'co.uk', 'com.pt'];

export type DnsRecord = {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  reason?: string;
};

export type VercelDomainStatus = {
  domain: string;
  /** Domain is attached to the Vercel project */
  registered: boolean;
  /** Ownership verified by Vercel (only false when the domain is used by another Vercel account) */
  verified: boolean;
  /** DNS is pointing to Vercel */
  configured: boolean;
  /** Records the institution must create in its DNS provider */
  dnsRecords: DnsRecord[];
};

export class VercelConfigError extends Error {}

type VercelError = { error?: { code?: string; message?: string } };

type ProjectDomainResponse = {
  name: string;
  verified: boolean;
  verification?: Array<{ type: string; domain: string; value: string; reason: string }>;
};

type DomainConfigResponse = {
  misconfigured: boolean;
  recommendedIPv4?: Array<{ rank: number; value: string[] }>;
  recommendedCNAME?: Array<{ rank: number; value: string }>;
};

function getConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    throw new VercelConfigError('Integração com a Vercel não configurada (VERCEL_API_TOKEN / VERCEL_PROJECT_ID).');
  }
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID };
}

async function vercelFetch<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & VercelError }> {
  const { token, teamId } = getConfig();
  const url = new URL(`${VERCEL_API}${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => ({}))) as T & VercelError;
  return { ok: response.ok, status: response.status, data };
}

function isApexDomain(domain: string): boolean {
  const labels = domain.split('.');
  const suffixLabels = TWO_LEVEL_SUFFIXES.some(suffix => domain.endsWith(`.${suffix}`)) ? 2 : 1;
  return labels.length === suffixLabels + 1;
}

async function getProjectDomain(domain: string): Promise<ProjectDomainResponse | null> {
  const { projectId } = getConfig();
  const { ok, status, data } = await vercelFetch<ProjectDomainResponse>(
    `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`
  );
  if (status === 404) return null;
  if (!ok) throw new Error(data.error?.message || `Erro ao consultar domínio na Vercel (${status})`);
  return data;
}

/** Adds the domain to the project (no-op if it is already there) */
export async function addDomain(domain: string): Promise<void> {
  if (await getProjectDomain(domain)) return;

  const { projectId } = getConfig();
  const { ok, status, data } = await vercelFetch(`/v10/projects/${projectId}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });

  if (!ok) {
    if (data.error?.code === 'domain_already_in_use') {
      throw new Error(`O domínio ${domain} já está em uso em outro projeto da Vercel.`);
    }
    throw new Error(data.error?.message || `Erro ao registrar domínio na Vercel (${status})`);
  }
}

/** Removes the domain from the project (no-op if it is not there) */
export async function removeDomain(domain: string): Promise<void> {
  const { projectId } = getConfig();
  const { ok, status, data } = await vercelFetch(
    `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`,
    { method: 'DELETE' }
  );
  if (!ok && status !== 404) {
    throw new Error(data.error?.message || `Erro ao remover domínio da Vercel (${status})`);
  }
}

export async function getDomainStatus(domain: string): Promise<VercelDomainStatus> {
  let projectDomain = await getProjectDomain(domain);

  if (!projectDomain) {
    return { domain, registered: false, verified: false, configured: false, dnsRecords: [] };
  }

  const { projectId } = getConfig();

  // Ask Vercel to re-check ownership when still pending
  if (!projectDomain.verified) {
    const verify = await vercelFetch<ProjectDomainResponse>(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`,
      { method: 'POST' }
    );
    if (verify.ok) projectDomain = verify.data;
  }

  const config = await vercelFetch<DomainConfigResponse>(
    `/v6/domains/${encodeURIComponent(domain)}/config?projectIdOrName=${projectId}`
  );
  const configured = config.ok ? !config.data.misconfigured : false;

  const dnsRecords: DnsRecord[] = [];

  if (!configured) {
    if (isApexDomain(domain)) {
      const ipv4 = config.data.recommendedIPv4?.find(r => r.rank === 1)?.value[0] ?? DEFAULT_A_RECORD;
      dnsRecords.push({ type: 'A', name: domain, value: ipv4 });
    } else {
      const cname = config.data.recommendedCNAME?.find(r => r.rank === 1)?.value ?? DEFAULT_CNAME;
      dnsRecords.push({ type: 'CNAME', name: domain, value: cname.replace(/\.$/, '') });
    }
  }

  for (const item of projectDomain.verification ?? []) {
    dnsRecords.push({
      type: item.type as DnsRecord['type'],
      name: item.domain,
      value: item.value,
      reason: item.reason,
    });
  }

  return {
    domain,
    registered: true,
    verified: projectDomain.verified,
    configured,
    dnsRecords,
  };
}
