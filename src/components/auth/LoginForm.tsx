'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { SendSignInLinkUseCase } from '@/_core/modules/auth/core/use-cases/send-sign-in-link/send-sign-in-link.use-case';
import { SignInWithPasswordUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-password/sign-in-with-password.use-case';
import { SendPasswordResetEmailUseCase } from '@/_core/modules/auth/core/use-cases/send-password-reset-email/send-password-reset-email.use-case';
import { Button } from '@/components/button'

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Por favor, insira um endereço de email válido para recuperar sua senha', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const sendPasswordResetEmailUseCase = container.get<SendPasswordResetEmailUseCase>(
        Register.auth.useCase.SendPasswordResetEmailUseCase
      );

      const result = await sendPasswordResetEmailUseCase.execute({ email });

      if (result.success) {
        setMessage({
          text: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
          type: 'success',
        });
        setShowForgotPassword(false);
      } else {
        setMessage({
          text: result.message || 'Erro ao enviar email de recuperação',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setMessage({
        text: 'Erro ao enviar email de recuperação. Tente novamente.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Por favor, insira um endereço de email válido', type: 'error' });
      return;
    }

    if (usePassword && !password) {
      setMessage({ text: 'Por favor, insira sua senha', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (usePassword) {
        // Sign in with password
        try {
          const signInWithPasswordUseCase = container.get<SignInWithPasswordUseCase>(
            Register.auth.useCase.SignInWithPasswordUseCase
          );

          const result = await signInWithPasswordUseCase.execute({
            email,
            password,
          });

          if (result.success) {
            setMessage({
              text: 'Login realizado com sucesso! Redirecionando...',
              type: 'success',
            });
            
            // Redirect to home after successful login
            setTimeout(() => {
              router.push('/');
            }, 1000);
          }
        } catch (error) {
          console.error('Error signing in with password:', error);
          setMessage({
            text: 'Email ou senha incorretos. Tente novamente.',
            type: 'error',
          });
        }
      } else {
        // Send sign-in link to email
        const redirectUrl = `${window.location.origin}/auth/confirm`;
        
        localStorage.setItem('emailForSignIn', email);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Email saved to localStorage from LoginForm: ${email}`);
          console.log(`Redirect URL: ${redirectUrl}`);
        }
        
        try {
          const sendSignInLinkUseCase = container.get<SendSignInLinkUseCase>(
            Register.auth.useCase.SendSignInLinkUseCase
          );

          const result = await sendSignInLinkUseCase.execute({
            email,
            redirectUrl,
          });

          if (result.success) {
            setMessage({
              text: 'Verifique seu email! Enviamos um link de acesso.',
              type: 'success',
            });
            setEmail('');
          } else {
            setMessage({
              text: 'Falha ao enviar o link. Tente novamente.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error getting SendSignInLinkUseCase:', error);
          setMessage({
            text: 'Serviço indisponível. Tente novamente mais tarde.',
            type: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error in login:', error);
      setMessage({
        text: 'Ocorreu um erro. Tente novamente mais tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Content */}
        <div className="relative z-10 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg transform transition-transform hover:scale-105">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Bem-vindo de volta
            </h2>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1"
              >
                Endereço de Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Checkbox para usar senha */}
            <div className="flex items-center gap-2">
              <input
                id="usePassword"
                type="checkbox"
                checked={usePassword}
                onChange={(e) => {
                  setUsePassword(e.target.checked);
                  if (!e.target.checked) {
                    setPassword('');
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isLoading}
              />
              <label 
                htmlFor="usePassword" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Acessar com senha
              </label>
            </div>

            {/* Campo de senha condicional */}
            {usePassword && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1"
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg 
                      className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    required={usePassword}
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg 
                      className="animate-spin h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : usePassword ? (
                  <>
                    <span>Entrar</span>
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Enviar Link de Acesso</span>
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Button>
          </form>
          
          {/* Message Feedback */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl border-2 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' 
                  ? 'bg-green-50/80 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                  : 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {message.type === 'success' ? (
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={usePassword 
                    ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    : "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  }
                />
              </svg>
              <p>{usePassword ? 'Acesso direto com email e senha' : 'Enviaremos um link seguro para o seu email'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          />
        </svg>
        <span>Autenticação segura sem senha</span>
      </div>
    </div>
  );
}
