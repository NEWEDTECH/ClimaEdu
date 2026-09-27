'use client';

import { useCallback, useMemo } from 'react';
import { useProfile } from '@/context/zustand/useProfile';

/** Papéis com acesso a todas as instituições da plataforma */
const GLOBAL_ADMIN_ROLES = ['SUPER_ADMIN', 'SYSTEM_ADMIN'];

/**
 * Regra única de escopo por instituição:
 * - SUPER_ADMIN e SYSTEM_ADMIN gerenciam todas as instituições;
 * - os demais papéis (LOCAL_ADMIN, CONTENT_MANAGER, TUTOR, STUDENT) só a instituição
 *   atual — a do domínio pelo qual entraram (ou a selecionada no seletor de perfil).
 */
export function useInstitutionScope() {
  const { infoUser } = useProfile();
  const role = infoUser.currentRole;
  const currentInstitutionId = infoUser.currentIdInstitution || null;
  const isGlobalAdmin = !!role && GLOBAL_ADMIN_ROLES.includes(role);

  const canAccessInstitution = useCallback(
    (institutionId: string | null | undefined) =>
      isGlobalAdmin || (!!institutionId && institutionId === currentInstitutionId),
    [isGlobalAdmin, currentInstitutionId]
  );

  /** Mantém apenas as instituições que o usuário pode gerenciar */
  const filterInstitutions = useCallback(
    <T extends { id: string }>(institutions: T[]): T[] =>
      isGlobalAdmin ? institutions : institutions.filter(inst => inst.id === currentInstitutionId),
    [isGlobalAdmin, currentInstitutionId]
  );

  /** Instituição que a tela deve abrir selecionada: a atual, se estiver na lista; senão a primeira */
  const pickDefaultInstitutionId = useCallback(
    <T extends { id: string }>(institutions: T[]): string =>
      institutions.find(inst => inst.id === currentInstitutionId)?.id ?? institutions[0]?.id ?? '',
    [currentInstitutionId]
  );

  return useMemo(
    () => ({
      role,
      /** Papel ainda não carregado (login em andamento) */
      isReady: !!role,
      isGlobalAdmin,
      currentInstitutionId,
      canAccessInstitution,
      filterInstitutions,
      pickDefaultInstitutionId,
    }),
    [role, isGlobalAdmin, currentInstitutionId, canAccessInstitution, filterInstitutions, pickDefaultInstitutionId]
  );
}
