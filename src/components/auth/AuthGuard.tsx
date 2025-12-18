'use client';

import { auth } from "@/_core/shared/firebase/firebase-client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/context/zustand/useProfile';
import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UserSymbols } from '@/_core/shared/container/modules/user/symbols';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { GetUserAssociationsUseCase } from '@/_core/modules/user/core/use-cases/get-user-associations/get-user-associations.use-case';
import { RecordDailyAccessUseCase } from '@/_core/modules/user/core/use-cases/record-daily-access/record-daily-access.use-case';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import { UserRole } from '@/_core/modules/user/core/entities/User';
import { LoadingSpinner } from '@/components/loader';
import { Button } from '@/components/button'

// Definir mapeamento de rotas e roles permitidas
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Rotas de estudante
  '/student': ['STUDENT'],
  '/student/activities': ['STUDENT'],
  '/student/tutoring': ['STUDENT'],
  '/student/certificates': ['STUDENT'],
  '/student/achievements': ['STUDENT'],
  '/student/settings': ['STUDENT'],
  
  // Rotas de tutor
  '/tutor': ['TUTOR', 'CONTENT_MANAGER'],
  '/tutor/follow-up': ['TUTOR', 'CONTENT_MANAGER'],
  '/tutor/reports': ['TUTOR', 'CONTENT_MANAGER', 'LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/tutor/courses': ['TUTOR', 'CONTENT_MANAGER'],
  '/tutor/tutoring': ['TUTOR', 'CONTENT_MANAGER'],
  
  // Rotas de admin
  '/admin': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/institution': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/achievements': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/podcast': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/student': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/turmas': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/tutor': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/gestor': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/trails': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/courses': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/allusers': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/create-user': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
  '/admin/settings': ['LOCAL_ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'],
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // Função para verificar se usuário tem acesso à rota atual
  const checkRouteAccess = useCallback((currentPath: string, userRole: string | null): boolean => {
    if (!userRole) return true; // Se não tem role ainda, permite (está inicializando)
    
    // Rotas públicas ou que todos podem acessar
    const publicRoutes = ['/', '/login', '/social', '/podcast'];
    if (publicRoutes.includes(currentPath)) return true;
    
    // Verificar se a rota atual está no mapeamento
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      // Verificar se a rota atual começa com a rota definida
      if (currentPath.startsWith(route)) {
        return allowedRoles.includes(userRole);
      }
    }
    
    // Se a rota não está mapeada, permite acesso
    return true;
  }, []);

  const initializeUserData = useCallback(async (userId: string) => {
    try {
      // console.log('🚀 AuthGuard: Initializing user data for:', userId);
      setIsLoading(true);
      setInitializationError(null);

      // Passo 1: Buscar dados do usuário pelo ID do Firebase Auth
      const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado no banco de dados');
      }

      // console.log('✅ AuthGuard: User found:', user.name);

      let currentInstitutionId: string | null = null;
      let institutionsRoleData: Array<{
        idInstitution: string;
        nameInstitution: string;
        roleInstitution: UserRole;
        primary_color: string;
        secondary_color: string;
      }> = [];

      if (user.role !== 'SUPER_ADMIN') {
        // Passo 2: Listar todas as instituições que o usuário pertence
        const getUserAssociationsUseCase = container.get<GetUserAssociationsUseCase>(
          Register.user.useCase.GetUserAssociationsUseCase
        );

        const userAssociations = await getUserAssociationsUseCase.execute({
          userId: user.id
        });

        // Buscar roles do usuário em cada instituição
        const userInstitutionRepository = container.get<UserInstitutionRepository>(
          Register.institution.repository.UserInstitutionRepository
        );
        
        const userInstitutionAssociations = await userInstitutionRepository.findByUserId(user.id);

        console.log('🔍 AuthGuard: userInstitutionAssociations:', userInstitutionAssociations);

        // Criar um map único de instituição+role (suporta múltiplas roles na mesma instituição)
        institutionsRoleData = userInstitutionAssociations.map(assoc => {
          const association = userAssociations.find(ua => ua.id === assoc.institutionId);
          
          if (!association) return null;
          
          return {
            idInstitution: association.id,
            nameInstitution: association.name,
            roleInstitution: assoc.userRole as UserRole,
            primary_color: association.settings.primaryColor!,
            secondary_color: association.settings.secondaryColor!,
          };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        console.log('✅ AuthGuard: institutionsRoleData final:', institutionsRoleData);

        // Salvar no context/zustand: infoInstitutionsRole
        setInfoInstitutionsRole(institutionsRoleData);

        // Passo 3: Buscar no localStorage o último ID da instituição e role salvos
        const savedInstitutionId = localStorage.getItem('last-institution-id');
        const savedRole = localStorage.getItem('last-selected-role');

        // Se tiver uma instituição E role salvos, tentar usar essa combinação específica
        if (savedInstitutionId && savedRole) {
          const matchingAssociation = institutionsRoleData.find(
            inst => inst.idInstitution === savedInstitutionId && inst.roleInstitution === savedRole
          );
          if (matchingAssociation) {
            currentInstitutionId = savedInstitutionId;
          }
        }
        
        // Se não encontrou, usar a primeira disponível
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
        // console.log('🔍 AuthGuard: Fetching institution with ID:', currentInstitutionId);
        const institution = await institutionRepository.findById(currentInstitutionId);

        if (!institution) {
          throw new Error('Instituição não encontrada');
        }

        // console.log('✅ AuthGuard: Institution found:', institution.name);

        // Buscar a role correta para esta instituição
        const currentInstitutionRole = institutionsRoleData.find(
          inst => inst.idInstitution === currentInstitutionId
        );

        // Passo 5: Salvar os dados da instituição com a role correta
        setInfoInstitutions({
          institutions: {
            idInstitution: institution.id,
            nameInstitution: institution.name,
            urlImage: institution.settings.logoUrl || '',
            roleInstitution: (currentInstitutionRole?.roleInstitution || user.role) as UserRole,
            primary_color: institution.settings.primaryColor!,
            secondary_color: institution.settings.secondaryColor!
          }
        });
      }

      // Passo 6: Salvar os dados do usuário com a role correta da instituição selecionada
      let currentRole = user.role;
      
      if (user.role !== 'SUPER_ADMIN') {
        const savedRole = localStorage.getItem('last-selected-role');
        
        // Tentar usar a role salva se existir e for válida para esta instituição
        if (savedRole && currentInstitutionId) {
          const matchingAssociation = institutionsRoleData.find(
            inst => inst.idInstitution === currentInstitutionId && inst.roleInstitution === savedRole
          );
          
          if (matchingAssociation) {
            currentRole = matchingAssociation.roleInstitution as UserRole;
          } else {
            // Se não encontrou a role salva, buscar qualquer role desta instituição
            const anyRoleForInstitution = institutionsRoleData.find(
              inst => inst.idInstitution === currentInstitutionId
            );
            currentRole = (anyRoleForInstitution?.roleInstitution || user.role) as UserRole;
          }
        } else {
          // Se não tem role salva, usar a primeira role desta instituição
          const currentInstitutionRole = institutionsRoleData.find(
            inst => inst.idInstitution === currentInstitutionId
          );
          currentRole = (currentInstitutionRole?.roleInstitution || user.role) as UserRole;
        }
      }
      
      setInfoUser({
        ...infoUser,
        id: user.id,
        name: user.name,
        currentRole: currentRole,
        currentIdInstitution: currentInstitutionId!
      });

      // Passo 7: Salvar esse ID da instituição no localStorage
      if (currentInstitutionId) {
        setLastInstitutionId(currentInstitutionId);
      }

      // Passo 8: Registrar acesso diário para tracking de conquistas
      if (currentInstitutionId) {
        try {
          const recordDailyAccessUseCase = container.get<RecordDailyAccessUseCase>(
            UserSymbols.useCases.RecordDailyAccessUseCase
          );

          // Chamar use case de forma assíncrona (não bloqueia o login)
          recordDailyAccessUseCase.execute({
            userId,
            institutionId: currentInstitutionId
          }).catch((error) => {
            console.error('❌ AuthGuard: Failed to record daily access:', error);
            // Não falhar o AuthGuard por causa disso
          });
        } catch (error) {
          console.error('❌ AuthGuard: Failed to get RecordDailyAccessUseCase:', error);
          // Não falhar o AuthGuard por causa disso
        }
      }

      // console.log('✅ AuthGuard: User data initialization completed');
      setIsLoading(false);
      setIsInitialized(true);

    } catch (error) {
      console.error('❌ AuthGuard: Error initializing user data:', error);
      setInitializationError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsLoading(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearUserData = useCallback(() => {
    // console.log('🧹 AuthGuard: Clearing user data on logout');
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
        primary_color: '',
        secondary_color: '',
        roleInstitution: null
      }
    });
    setInfoInstitutionsRole([]);
    setIsInitialized(false); // ✅ Reset initialization state
    setIsLoading(false); // ✅ Reset loading state
    setInitializationError(null);
    
    // console.log('✅ AuthGuard: User data cleared, ready for new login');
  }, [setInfoUser, setInfoInstitutions, setInfoInstitutionsRole]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // console.log('🔄 AuthGuard: Auth state changed', { 
      //   hasUser: !!user, 
      //   userId: user?.uid,
      //   isInitialized, 
      //   isLoading 
      // });

      if (user && typeof user.uid === "string") {
        // console.log("🙋‍♂️ AuthGuard: User authenticated:", { id: user.uid, name: user.displayName });
        
        // Só inicializar se ainda não foi inicializado e não está carregando
        if (!isInitialized && !isLoading) {
          // console.log('🚀 AuthGuard: Starting user data initialization...');
          await initializeUserData(user.uid);
        } else {
          // console.log('⏭️ AuthGuard: Skipping initialization', { isInitialized, isLoading });
        }
      } else {
        // console.log("🙋‍♂️ AuthGuard: User not authenticated - clearing data");
        clearUserData();
      }
    });

    return () => unsubscribe();
  }, [clearUserData, initializeUserData, isInitialized, isLoading]);

  // Verificar acesso à rota atual quando usuário estiver inicializado
  useEffect(() => {
    if (isInitialized && infoUser.currentRole && pathname) {
      const hasAccess = checkRouteAccess(pathname, infoUser.currentRole);
      
      if (!hasAccess) {
        console.warn(`⛔ AuthGuard: User with role "${infoUser.currentRole}" attempted to access restricted route: ${pathname}`);
        
        // Redirecionar para a página inicial apropriada baseado na role
        switch (infoUser.currentRole) {
          case 'STUDENT':
            router.push('/');
            break;
          case 'TUTOR':
          case 'CONTENT_MANAGER':
            router.push('/');
            break;
          case 'LOCAL_ADMIN':
          case 'SYSTEM_ADMIN':
          case 'SUPER_ADMIN':
            router.push('/');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [isInitialized, infoUser.currentRole, pathname, checkRouteAccess, router]);

  // Mostrar loading durante a inicialização
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
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
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
