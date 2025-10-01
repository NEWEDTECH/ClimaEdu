import { Container } from 'inversify';
import { CertificateSymbols } from './symbols';
import { CertificateRepository } from '@/_core/modules/certificate/infrastructure/repositories/CertificateRepository';
import { FirebaseCertificateRepository } from '@/_core/modules/certificate/infrastructure/repositories/implementations/FirebaseCertificateRepository';
import { GenerateCertificateUseCase } from '@/_core/modules/certificate/core/use-cases/generate-certificate/generate-certificate.use-case';
import { GetUserCertificatesUseCase } from '@/_core/modules/certificate/core/use-cases/get-user-certificates/get-user-certificates.use-case';
import { GetCertificateByIdUseCase } from '@/_core/modules/certificate/core/use-cases/get-certificate-by-id/get-certificate-by-id.use-case';

/**
 * Register Certificate module dependencies
 * @param container The DI container
 */
export function registerCertificateModule(container: Container): void {
  // Register repositories
  container.bind<CertificateRepository>(CertificateSymbols.repositories.CertificateRepository).to(FirebaseCertificateRepository);
  
  // Register use cases
  container.bind<GenerateCertificateUseCase>(CertificateSymbols.useCases.GenerateCertificateUseCase).to(GenerateCertificateUseCase);
  container.bind<GetUserCertificatesUseCase>(CertificateSymbols.useCases.GetUserCertificatesUseCase).to(GetUserCertificatesUseCase);
  container.bind<GetCertificateByIdUseCase>(CertificateSymbols.useCases.GetCertificateByIdUseCase).to(GetCertificateByIdUseCase);
}
