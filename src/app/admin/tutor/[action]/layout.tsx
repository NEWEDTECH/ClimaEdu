'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';
import { getUserInstitutionIds } from '@/components/institution/resource-institution';

/** Bloqueia o acesso quando o registro da URL pertence a outra instituição */
export default function InstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ action: string }>();
  const value = params.action;

  return (
    <InstitutionResourceGuard
      resourceKey={value}
      backHref="/admin/tutor"
      resolveInstitutionIds={() => (value !== 'create' ? getUserInstitutionIds(value) : Promise.resolve(null))}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
