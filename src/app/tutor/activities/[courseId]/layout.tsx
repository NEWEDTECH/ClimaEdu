'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';
import { getCourseInstitutionIds } from '@/components/institution/resource-institution';

/** Bloqueia o acesso quando o registro da URL pertence a outra instituição */
export default function InstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ courseId: string }>();
  const value = params.courseId;

  return (
    <InstitutionResourceGuard
      resourceKey={value}
      backHref="/tutor"
      resolveInstitutionIds={() => getCourseInstitutionIds(value)}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
