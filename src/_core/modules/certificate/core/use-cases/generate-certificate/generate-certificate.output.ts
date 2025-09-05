import { Certificate } from '../../entities/Certificate';

/**
 * Output for generating a certificate
 */
export interface GenerateCertificateOutput {
  certificate: Certificate;
  isNew: boolean;
}