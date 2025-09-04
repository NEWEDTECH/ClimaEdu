import { Certificate } from '../../entities/Certificate';

/**
 * Output for getting user certificates
 */
export interface GetUserCertificatesOutput {
  certificates: Certificate[];
}