import { Certificate } from '../../entities/Certificate';

/**
 * Output for getting a certificate by ID
 */
export interface GetCertificateByIdOutput {
  certificate: Certificate | null;
}