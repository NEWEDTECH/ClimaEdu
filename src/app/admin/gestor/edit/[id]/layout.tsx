'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';
import { getUserInstitutionIds } from '@/components/institution/resource-institution';

/** Bloqueia o acesso quando o registro da URL pertence a outra instituição */
export default function InstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const value = params.id;

  return (
    <InstitutionResourceGuard
      resourceKey={value}
      backHref="/admin/gestor"
      resolveInstitutionIds={() => getUserInstitutionIds(value)}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
