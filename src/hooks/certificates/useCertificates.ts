import { useState, useEffect, useCallback } from 'react';
import { Certificate } from '@/_core/modules/certificate';
import { GetUserCertificatesUseCase } from '@/_core/modules/certificate';
import { CertificateSymbols } from '@/_core/shared/container/modules/certificate/symbols';
import { container } from '@/_core/shared/container';
import { useProfile } from '@/context/zustand/useProfile';

interface UseCertificatesState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

interface UseCertificatesReturn extends UseCertificatesState {
  refreshCertificates: () => Promise<void>;
}

/**
 * Hook for managing user certificates
 * Provides functionality to list and refresh user certificates
 */
export function useCertificates(): UseCertificatesReturn {
  const { infoUser } = useProfile();
  const [state, setState] = useState<UseCertificatesState>({
    certificates: [],
    loading: true,
    error: null,
  });

  const getUserCertificatesUseCase = container.get<GetUserCertificatesUseCase>(
    CertificateSymbols.useCases.GetUserCertificatesUseCase
  );

  const loadCertificates = useCallback(async () => {
    if (!infoUser?.id) {
      setState(prev => ({ ...prev, loading: false, error: 'User not authenticated' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await getUserCertificatesUseCase.execute({
        userId: infoUser.id
      });

      setState(prev => ({
        ...prev,
        certificates: result.certificates,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load certificates';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [infoUser?.id, getUserCertificatesUseCase]);

  const refreshCertificates = useCallback(async () => {
    await loadCertificates();
  }, [loadCertificates]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  return {
    ...state,
    refreshCertificates,
  };
}