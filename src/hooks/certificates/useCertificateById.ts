import { useState, useEffect, useCallback } from 'react';
import { Certificate } from '@/_core/modules/certificate';
import { GetCertificateByIdUseCase } from '@/_core/modules/certificate';
import { CertificateSymbols } from '@/_core/shared/container/modules/certificate/symbols';
import { container } from '@/_core/shared/container';

interface UseCertificateByIdState {
  certificate: Certificate | null;
  loading: boolean;
  error: string | null;
}

interface UseCertificateByIdReturn extends UseCertificateByIdState {
  refreshCertificate: () => Promise<void>;
}

/**
 * Hook for getting a certificate by ID
 * Provides functionality to retrieve a specific certificate
 */
export function useCertificateById(certificateId: string | null): UseCertificateByIdReturn {
  const [state, setState] = useState<UseCertificateByIdState>({
    certificate: null,
    loading: false,
    error: null,
  });

  const getCertificateByIdUseCase = container.get<GetCertificateByIdUseCase>(
    CertificateSymbols.useCases.GetCertificateByIdUseCase
  );

  const loadCertificate = useCallback(async () => {
    if (!certificateId) {
      setState(prev => ({ ...prev, loading: false, certificate: null, error: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await getCertificateByIdUseCase.execute({
        certificateId
      });

      setState(prev => ({
        ...prev,
        certificate: result.certificate,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load certificate';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        certificate: null
      }));
    }
  }, [certificateId, getCertificateByIdUseCase]);

  const refreshCertificate = useCallback(async () => {
    await loadCertificate();
  }, [loadCertificate]);

  useEffect(() => {
    loadCertificate();
  }, [loadCertificate]);

  return {
    ...state,
    refreshCertificate,
  };
}