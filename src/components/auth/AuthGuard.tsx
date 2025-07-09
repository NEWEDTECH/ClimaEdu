'use client';

import { auth } from "@/_core/shared/firebase/firebase-client";
import { useEffect, useState, useCallback } from "react";
import { useProfile } from '@/context/zustand/useProfile';
import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { GetUserAssociationsUseCase } from '@/_core/modules/user/core/use-cases/get-user-associations/get-user-associations.use-case';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import { LoadingSpinner } from '@/components/loader';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const {
    infoUser,
    setInfoUser,
    setInfoInstitutions,
    setInfoInstitutionsRole
  } = useProfile();
  
  const { /*getLastInstitutionId,*/ setLastInstitutionId } = useInstitutionStorage();

  const initializeUserData = useCallback(async (userId: string) => {
    try {
      console.log('🚀 AuthGuard: Initializing user data for:', userId);
      setIsLoading(true);
      setInitializationError(null);

      // Passo 1: Buscar dados do usuário pelo ID do Firebase Auth
      const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado no banco de dados');
      }

      console.log('✅ AuthGuard: User found:', user.name);

      let currentInstitutionId = null;

      if (user.role !== 'SUPER_ADMIN') {
        // Passo 2: Listar todas as instituições que o usuário pertence
        const getUserAssociationsUseCase = container.get<GetUserAssociationsUseCase>(
          Register.user.useCase.GetUserAssociationsUseCase
        );

        const userAssociations = await getUserAssociationsUseCase.execute({
          userId: user.id
        });

        const institutionsRoleData = userAssociations.map(association => ({
          idInstitution: association.id,
          nameInstitution: association.name,
          roleInstitution: null
        }));

        console.log('✅ AuthGuard: User associations found:', institutionsRoleData.length);

        // Salvar no context/zustand: infoInstitutionsRole
        setInfoInstitutionsRole(institutionsRoleData);

        // Passo 3: Buscar no localStorage o último ID da instituição que está salvo
        // currentInstitutionId = getLastInstitutionId();

        // Se não tiver nenhum, pegar qualquer ID de instituição que foi obtido
        if (!currentInstitutionId && institutionsRoleData.length > 0) {
          currentInstitutionId = institutionsRoleData[0].idInstitution;
        }

        if (!currentInstitutionId) {
          throw new Error('Nenhuma instituição encontrada para o usuário');
        }

        // Passo 4: Buscar dados da instituição
        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );
        console.log('🔍 AuthGuard: Fetching institution with ID:', currentInstitutionId);
        const institution = await institutionRepository.findById(currentInstitutionId);

        if (!institution) {
          throw new Error('Instituição não encontrada');
        }

        console.log('✅ AuthGuard: Institution found:', institution.name);

        // Passo 5: Salvar os dados da instituição
        setInfoInstitutions({
          institutions: {
            idInstitution: institution.id,
            nameInstitution: institution.name,
            urlImage: institution.settings.logoUrl || '',
            roleInstitution: user.role
          }
        });
      }

      // Passo 6: Salvar os dados do usuário
      const currentRole = user.role;
      setInfoUser({
        ...infoUser,
        id: user.id,
        name: user.name,
        currentRole: currentRole,
        currentIdInstitution: currentInstitutionId || ''
      });

      // Passo 7: Salvar esse ID da instituição no localStorage
      if (currentInstitutionId) {
        setLastInstitutionId(currentInstitutionId);
      }

      console.log('✅ AuthGuard: User data initialization completed');
      setIsLoading(false);
      setIsInitialized(true);

    } catch (error) {
      console.error('❌ AuthGuard: Error initializing user data:', error);
      setInitializationError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  }, []);

  const clearUserData = useCallback(() => {
    console.log('🧹 AuthGuard: Clearing user data on logout');
    setInfoUser({
      id: '',
      name: '',
      currentRole: null,
      currentIdInstitution: '',
    });
    setInfoInstitutions({
      institutions: {
        idInstitution: '',
        nameInstitution: '',
        urlImage: '',
        roleInstitution: null
      }
    });
    setInfoInstitutionsRole([]);
    setIsInitialized(false); // ✅ Reset initialization state
    setIsLoading(false); // ✅ Reset loading state
    setInitializationError(null);
    
    console.log('✅ AuthGuard: User data cleared, ready for new login');
  }, [setInfoUser, setInfoInstitutions, setInfoInstitutionsRole]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('🔄 AuthGuard: Auth state changed', { 
        hasUser: !!user, 
        userId: user?.uid,
        isInitialized, 
        isLoading 
      });

      if (user && typeof user.uid === "string") {
        console.log("🙋‍♂️ AuthGuard: User authenticated:", { id: user.uid, name: user.displayName });
        
        // Só inicializar se ainda não foi inicializado e não está carregando
        if (!isInitialized && !isLoading) {
          console.log('🚀 AuthGuard: Starting user data initialization...');
          await initializeUserData(user.uid);
        } else {
          console.log('⏭️ AuthGuard: Skipping initialization', { isInitialized, isLoading });
        }
      } else {
        console.log("🙋‍♂️ AuthGuard: User not authenticated - clearing data");
        clearUserData();
      }
    });

    return () => unsubscribe();
  }, [clearUserData, initializeUserData, isInitialized, isLoading]);

  // Mostrar loading durante a inicialização
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{initializationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
