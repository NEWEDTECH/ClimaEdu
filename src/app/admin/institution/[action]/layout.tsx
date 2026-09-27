'use client';

import { useParams } from 'next/navigation';
import { InstitutionResourceGuard } from '@/components/institution/InstitutionResourceGuard';

/** Criar instituições é exclusivo de SUPER_ADMIN e SYSTEM_ADMIN (a edição tem seu próprio guarda em [id]) */
export default function CreateInstitutionGuardLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id?: string }>(); // nesta rota nunca há id: é sempre criação

  return (
    <InstitutionResourceGuard
      resourceKey={id ?? 'create'}
      backHref="/admin/institution"
      deniedMessage="Somente administradores do sistema podem criar instituições."
      // Nenhuma instituição "pertence" a um cadastro novo: só admins globais passam
      resolveInstitutionIds={() => Promise.resolve(id ? null : [])}
    >
      {children}
    </InstitutionResourceGuard>
  );
}
