import { TERMOS_DE_USO } from './termos-de-uso';
import { TERMOS_DE_ACEITE } from './termos-de-aceite';
import { POLITICA_DE_PRIVACIDADE } from './politica-de-privacidade';

/**
 * Versão atual dos termos.
 * Ao alterar qualquer um dos textos de forma relevante, incremente esta versão
 * (ex.: '2026-11-16' -> '2027-01-10'): todos os usuários verão o modal de novo
 * e precisarão aceitar a nova versão.
 */
export const TERMS_VERSION = '2026-11-19';

export type LegalDocument = {
  id: 'termos-de-uso' | 'termos-de-aceite' | 'politica-de-privacidade';
  label: string;
  content: string;
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  { id: 'termos-de-uso', label: 'Termos de Uso', content: TERMOS_DE_USO },
  { id: 'termos-de-aceite', label: 'Termos de Aceite', content: TERMOS_DE_ACEITE },
  { id: 'politica-de-privacidade', label: 'Política de Privacidade', content: POLITICA_DE_PRIVACIDADE },
];
