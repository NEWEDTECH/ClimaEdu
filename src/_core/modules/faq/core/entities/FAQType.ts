/**
 * Público-alvo de uma FAQ.
 * GENERAL é exibida para todos os perfis.
 */
export enum FAQType {
  GENERAL = 'GENERAL',
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  ADMIN = 'ADMIN',
}

export const FAQ_TYPE_LABELS: Record<FAQType, string> = {
  [FAQType.GENERAL]: 'Geral (todos)',
  [FAQType.STUDENT]: 'Aluno',
  [FAQType.TUTOR]: 'Tutor',
  [FAQType.CONTENT_MANAGER]: 'Gestor de conteúdo',
  [FAQType.ADMIN]: 'Administrador',
};

export const FAQ_TYPES: FAQType[] = [
  FAQType.GENERAL,
  FAQType.STUDENT,
  FAQType.TUTOR,
  FAQType.CONTENT_MANAGER,
  FAQType.ADMIN,
];

/** Converte um valor salvo no banco em FAQType; FAQs antigas (sem tipo) viram GENERAL. */
export function parseFAQType(value: unknown): FAQType {
  return FAQ_TYPES.includes(value as FAQType) ? (value as FAQType) : FAQType.GENERAL;
}

const ADMIN_ROLES = ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'];

/** Perfis administrativos gerenciam as FAQs e, por isso, enxergam todos os tipos. */
export function canSeeAllFAQTypes(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

/** Tipos de FAQ visíveis para um perfil de usuário. */
export function getVisibleFAQTypes(role: string | null | undefined): FAQType[] {
  if (canSeeAllFAQTypes(role)) return FAQ_TYPES;

  switch (role) {
    case 'STUDENT':
      return [FAQType.GENERAL, FAQType.STUDENT];
    case 'TUTOR':
      return [FAQType.GENERAL, FAQType.TUTOR];
    case 'CONTENT_MANAGER':
      return [FAQType.GENERAL, FAQType.CONTENT_MANAGER];
    default:
      return [FAQType.GENERAL];
  }
}
