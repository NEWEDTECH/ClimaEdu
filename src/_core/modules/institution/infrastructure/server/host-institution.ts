import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';
import { getInstitutionDomainFromHost } from '@/_core/shared/domain/domain.utils';

/** Cache tag invalidated whenever an institution domain/branding changes */
export const INSTITUTION_DOMAIN_CACHE_TAG = 'institution-domains';

/** Serializable institution data needed to render the white label */
export type HostInstitution = {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type HostContext = {
  host: string;
  /** Institution domain requested by the host (null on the platform domain) */
  domain: string | null;
  institution: HostInstitution | null;
};

const findInstitutionByDomain = unstable_cache(
  async (domain: string): Promise<HostInstitution | null> => {
    const snapshot = await getAdminFirestore()
      .collection('institutions')
      .where('domain', '==', domain)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      domain: data.domain,
      logoUrl: data.settings?.logoUrl || undefined,
      coverImageUrl: data.settings?.coverImageUrl || undefined,
      primaryColor: data.settings?.primaryColor || undefined,
      secondaryColor: data.settings?.secondaryColor || undefined,
    };
  },
  ['institution-by-domain'],
  { tags: [INSTITUTION_DOMAIN_CACHE_TAG], revalidate: 300 }
);

/**
 * Resolves the institution of the current request based on its Host header.
 * The platform domain never hits Firestore.
 */
export async function getHostContext(): Promise<HostContext> {
  const headerList = await headers();
  // x-forwarded-host pode vir com vários valores separados por vírgula (proxies)
  const host = (headerList.get('x-forwarded-host') || headerList.get('host') || '').split(',')[0].trim();
  const domain = getInstitutionDomainFromHost(host);

  if (!domain) {
    return { host, domain: null, institution: null };
  }

  const institution = await findInstitutionByDomain(domain);
  return { host, domain, institution };
}
