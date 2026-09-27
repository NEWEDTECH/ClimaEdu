'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';

/** Admin local só configura a própria instituição */
export default function InstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();

  return (
    <InstitutionResourceGuard
      resourceKey={id}
      backHref="/admin/institution"
      resolveInstitutionIds={() => Promise.resolve([id])}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
