'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';
import { getPodcastInstitutionIds } from '@/components/institution/resource-institution';

/** Bloqueia o acesso quando o registro da URL pertence a outra instituição */
export default function InstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const value = params.id;

  return (
    <InstitutionResourceGuard
      resourceKey={value}
      backHref="/admin/podcast"
      resolveInstitutionIds={() => getPodcastInstitutionIds(value)}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
