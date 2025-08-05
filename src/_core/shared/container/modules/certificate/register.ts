import { Container } from 'inversify';
import { CertificateSymbols } from './symbols';
import { CertificateRepository } from '@/_core/modules/certificate/infrastructure/repositories/CertificateRepository';
import { FirebaseCertificateRepository } from '@/_core/modules/certificate/infrastructure/repositories/implementations/FirebaseCertificateRepository';

/**
 * Register Certificate module dependencies
 * @param container The DI container
 */
export function registerCertificateModule(container: Container): void {
  // Register repositories
  container.bind<CertificateRepository>(CertificateSymbols.repositories.CertificateRepository).to(FirebaseCertificateRepository);
  
  // Register use cases if any
}
