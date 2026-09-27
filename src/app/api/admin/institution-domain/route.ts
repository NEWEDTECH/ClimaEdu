import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAdminAuth, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';
import { isPlatformHost, normalizeDomain } from '@/_core/shared/domain/domain.utils';
import { INSTITUTION_DOMAIN_CACHE_TAG } from '@/_core/modules/institution/infrastructure/server/host-institution';
import { addDomain, getDomainStatus, removeDomain, VercelConfigError } from '@/_core/shared/vercel/vercel-domains';

const GLOBAL_ADMIN_ROLES = ['SUPER_ADMIN', 'SYSTEM_ADMIN'];

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Only global admins, or local admins of the institution, can manage its domain.
 * Expects "Authorization: Bearer <Firebase ID token>".
 */
async function authorize(request: NextRequest, institutionId: string): Promise<void> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Não autenticado');

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    throw new HttpError(401, 'Token inválido');
  }

  const firestore = getAdminFirestore();
  const user = await firestore.collection('users').doc(uid).get();
  if (GLOBAL_ADMIN_ROLES.includes(user.data()?.role)) return;

  const association = await firestore
    .collection('user_institutions')
    .where('userId', '==', uid)
    .where('institutionId', '==', institutionId)
    .where('userRole', '==', 'LOCAL_ADMIN')
    .limit(1)
    .get();

  if (association.empty) throw new HttpError(403, 'Sem permissão para gerenciar o domínio desta instituição');
}

async function getInstitutionDomain(institutionId: string): Promise<string> {
  const doc = await getAdminFirestore().collection('institutions').doc(institutionId).get();
  if (!doc.exists) throw new HttpError(404, 'Instituição não encontrada');
  return normalizeDomain(doc.data()?.domain);
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof VercelConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  console.error('Error managing institution domain:', error);
  const message = error instanceof Error ? error.message : 'Erro ao gerenciar domínio';
  return NextResponse.json({ error: message }, { status: 502 });
}

/** GET ?institutionId=... -> Vercel/DNS status of the institution domain */
export async function GET(request: NextRequest) {
  try {
    const institutionId = request.nextUrl.searchParams.get('institutionId');
    if (!institutionId) throw new HttpError(400, 'institutionId é obrigatório');

    await authorize(request, institutionId);
    const domain = await getInstitutionDomain(institutionId);
    if (isPlatformHost(domain)) {
      throw new HttpError(400, 'O domínio principal da plataforma não pode ser usado por uma instituição');
    }

    return NextResponse.json(await getDomainStatus(domain));
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST { institutionId, previousDomain? }
 * Registers the (already saved) institution domain in Vercel, removes the previous
 * one when it changed, and refreshes the white-label cache.
 */
export async function POST(request: NextRequest) {
  try {
    const { institutionId, previousDomain } = await request.json();
    if (!institutionId) throw new HttpError(400, 'institutionId é obrigatório');

    await authorize(request, institutionId);
    const domain = await getInstitutionDomain(institutionId);

    // Branding/domain changed: the white label must reflect it right away
    revalidateTag(INSTITUTION_DOMAIN_CACHE_TAG);

    // Nunca registra/remove o domínio da própria plataforma (derrubaria o acesso principal)
    if (isPlatformHost(domain)) {
      throw new HttpError(400, 'O domínio principal da plataforma não pode ser usado por uma instituição');
    }

    await addDomain(domain);

    const oldDomain = normalizeDomain(previousDomain);
    if (oldDomain && oldDomain !== domain && !isPlatformHost(oldDomain)) {
      const stillInUse = await getAdminFirestore()
        .collection('institutions')
        .where('domain', '==', oldDomain)
        .limit(1)
        .get();
      if (stillInUse.empty) await removeDomain(oldDomain);
    }

    return NextResponse.json(await getDomainStatus(domain));
  } catch (error) {
    return handleError(error);
  }
}
