'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { SignInWithEmailLinkUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { User } from '@/_core/modules/user/core/entities/User';

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Verificando seu link de acesso...');

  useEffect(() => {
    const handleEmailLink = async () => {
      try {
        // Get the current URL
        const url = window.location.href;

        // Check if the URL contains sign-in parameters
        const hasSignInParams = url.includes('mode=signIn') && url.includes('oobCode=');

        if (!hasSignInParams) {
          setStatus('error');
          setMessage('Link de acesso inválido.');
          return;
        }

        try {
          // Get the auth service from the container
          const authService = container.get<AuthService>(Register.auth.service.AuthService);

          // Check if user is already authenticated
          const isAlreadyAuthenticated = authService.isAuthenticated();
          const currentUserId = authService.getCurrentUserId();
          
          if (isAlreadyAuthenticated && currentUserId) {
            console.log('🔄 User already authenticated, redirecting to home');
            setStatus('success');
            setMessage('Você já está autenticado! Redirecionando...');
            
            // Redirect automatically after a short delay
            setTimeout(() => {
              router.push('/');
            }, 1500);
            return;
          }

          // Check if the current URL is a sign-in link
          const isSignInLink = authService.isSignInWithEmailLink(url);

          if (!isSignInLink) {
            setStatus('error');
            setMessage('Link de acesso inválido. Tente novamente.');
            return;
          }

          // Get email from URL or localStorage
          const urlParams = new URLSearchParams(window.location.search);
          const emailFromUrl = urlParams.get('email');
          const emailFromStorage = window.localStorage.getItem('emailForSignIn');
          const email = emailFromUrl || emailFromStorage;

          if (!email) {
            setStatus('error');
            setMessage('Não foi possível encontrar seu email. Tente fazer login novamente.');
            return;
          }

          try {
            // Get the use case from the container
            const signInWithEmailLinkUseCase = container.get<SignInWithEmailLinkUseCase>(
              Register.auth.useCase.SignInWithEmailLinkUseCase
            );

            // Execute the use case
            const result = await signInWithEmailLinkUseCase.execute({
              email,
              link: url,
            });

            if (result.success) {
              console.log('Sign-in successful, user ID:', result.userId);
              setStatus('success');
              setMessage('Login realizado com sucesso! Redirecionando...');

              // Clean up localStorage
              window.localStorage.removeItem('emailForSignIn');

              // Get user data and redirect automatically
              try {
                const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
                if (result.userId) {
                  const user = await userRepository.findById(result.userId);
                  
                  if (user) {
                    console.log('User data loaded successfully');
                  }
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }

              // Redirect automatically after a short delay
              setTimeout(() => {
                router.push('/');
              }, 1500);

            } else {
              // Check if user is actually authenticated despite use case failure
              const isNowAuthenticated = authService.isAuthenticated();
              const nowCurrentUserId = authService.getCurrentUserId();
              
              if (isNowAuthenticated && nowCurrentUserId) {
                console.log('🔄 Use case failed but user is authenticated, redirecting');
                setStatus('success');
                setMessage('Login realizado com sucesso! Redirecionando...');
                
                // Clean up localStorage
                window.localStorage.removeItem('emailForSignIn');
                
                // Redirect automatically
                setTimeout(() => {
                  router.push('/');
                }, 1500);
              } else {
                setStatus('error');
                setMessage('Falha no login. Tente novamente.');
              }
            }
          } catch (error) {
            console.error('Error during sign-in process:', error);
            
            // Check if user is actually authenticated despite error
            const isNowAuthenticated = authService.isAuthenticated();
            const nowCurrentUserId = authService.getCurrentUserId();
            
            if (isNowAuthenticated && nowCurrentUserId) {
              console.log('🔄 Error occurred but user is authenticated, redirecting');
              setStatus('success');
              setMessage('Login realizado com sucesso! Redirecionando...');
              
              // Clean up localStorage
              window.localStorage.removeItem('emailForSignIn');
              
              // Redirect automatically
              setTimeout(() => {
                router.push('/');
              }, 1500);
            } else {
              setStatus('error');
              setMessage('Serviço indisponível. Tente novamente mais tarde.');
            }
          }
        } catch (error) {
          console.error('Error getting AuthService:', error);
          setStatus('error');
          setMessage('Serviço de autenticação indisponível. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Error signing in with email link:', error);
        setStatus('error');
        setMessage('Ocorreu um erro. Tente novamente mais tarde.');
      }
    };

    handleEmailLink();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">ClimaEdu</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Confirmação de Autenticação
        </p>
      </header>

      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          {status === 'checking' && (
            <div className="animate-pulse">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Verificando</h2>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">Sucesso!</h2>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">Erro</h2>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Voltar ao Login
              </button>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
}
