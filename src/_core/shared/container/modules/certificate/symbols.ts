// Certificate module symbols
export const repositories = {
  CertificateRepository: Symbol.for('CertificateRepository'),
};

export const useCases = {
  GenerateCertificateUseCase: Symbol.for('GenerateCertificateUseCase'),
  GetUserCertificatesUseCase: Symbol.for('GetUserCertificatesUseCase'),
  GetCertificateByIdUseCase: Symbol.for('GetCertificateByIdUseCase'),
};

// Export all symbols for this module
export const CertificateSymbols = {
  repositories,
  useCases,
};
