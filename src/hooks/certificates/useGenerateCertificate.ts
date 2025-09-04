import { useState, useCallback } from 'react';
import { Certificate } from '@/_core/modules/certificate';
import { GenerateCertificateUseCase, GenerateCertificateInput } from '@/_core/modules/certificate';
import { CertificateSymbols } from '@/_core/shared/container/modules/certificate/symbols';
import { container } from '@/_core/shared/container';

interface UseGenerateCertificateState {
  loading: boolean;
  error: string | null;
}

interface UseGenerateCertificateReturn extends UseGenerateCertificateState {
  generateCertificate: (input: GenerateCertificateInput) => Promise<Certificate | null>;
}

/**
 * Hook for generating certificates
 * Provides functionality to generate certificates for completed courses
 */
export function useGenerateCertificate(): UseGenerateCertificateReturn {
  const [state, setState] = useState<UseGenerateCertificateState>({
    loading: false,
    error: null,
  });

  const generateCertificateUseCase = container.get<GenerateCertificateUseCase>(
    CertificateSymbols.useCases.GenerateCertificateUseCase
  );

  const generateCertificate = useCallback(async (input: GenerateCertificateInput): Promise<Certificate | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await generateCertificateUseCase.execute(input);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      return result.certificate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate certificate';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [generateCertificateUseCase]);

  return {
    ...state,
    generateCertificate,
  };
}