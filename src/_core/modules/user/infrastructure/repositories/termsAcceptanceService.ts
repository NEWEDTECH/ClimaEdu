import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';

/**
 * Aceite dos termos de uso / aceite / privacidade.
 * Fica numa coleção própria (um documento por usuário) para não ser
 * sobrescrito quando o documento do usuário em `users` é salvo.
 *
 * - termsOfUseAccepted / acceptanceTermAccepted / privacyPolicyAccepted: um aceite por documento
 * - generalTermsAccepted: true quando os três documentos acima foram aceitos
 * - teacherTermsAccepted: aceite específico de Professores/Criadores de Conteúdo (Seção B)
 */
const COLLECTION = 'terms_acceptances';

const cacheKey = (userId: string, version: string, requireTeacher: boolean) =>
  `terms-accepted:${userId}:${version}:${requireTeacher ? 'teacher' : 'general'}`;

function readCache(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeCache(key: string): void {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    /* sessionStorage indisponível: apenas não faz cache */
  }
}

export async function hasAcceptedTerms(
  userId: string,
  version: string,
  requireTeacher: boolean
): Promise<boolean> {
  const key = cacheKey(userId, version, requireTeacher);
  if (readCache(key)) return true;

  const snapshot = await getDoc(doc(firestore, COLLECTION, userId));
  const data = snapshot.exists() ? snapshot.data() : null;
  const accepted =
    !!data &&
    data.version === version &&
    data.generalTermsAccepted === true &&
    (!requireTeacher || data.teacherTermsAccepted === true);

  if (accepted) writeCache(key);
  return accepted;
}

export async function acceptTerms(
  userId: string,
  version: string,
  options: {
    termsOfUseAccepted: boolean;
    acceptanceTermAccepted: boolean;
    privacyPolicyAccepted: boolean;
    teacherTermsAccepted: boolean;
    role: string | null;
  }
): Promise<void> {
  const generalTermsAccepted =
    options.termsOfUseAccepted && options.acceptanceTermAccepted && options.privacyPolicyAccepted;
  if (!generalTermsAccepted) {
    throw new Error('Todos os termos obrigatórios precisam ser aceitos.');
  }

  await setDoc(doc(firestore, COLLECTION, userId), {
    userId,
    version,
    termsOfUseAccepted: options.termsOfUseAccepted,
    acceptanceTermAccepted: options.acceptanceTermAccepted,
    privacyPolicyAccepted: options.privacyPolicyAccepted,
    generalTermsAccepted,
    teacherTermsAccepted: options.teacherTermsAccepted,
    roleAtAcceptance: options.role,
    acceptedAt: serverTimestamp(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  });
  writeCache(cacheKey(userId, version, false));
  if (options.teacherTermsAccepted) writeCache(cacheKey(userId, version, true));
}

/** Perfis que criam/gerenciam conteúdo e, por isso, precisam do aceite de Professor. */
export function roleRequiresTeacherTerms(role: string | null | undefined): boolean {
  return !!role && role !== 'STUDENT';
}
