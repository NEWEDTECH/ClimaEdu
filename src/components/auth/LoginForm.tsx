'use client';

import { useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { SendSignInLinkUseCase } from '@/_core/modules/auth/core/use-cases/send-sign-in-link/send-sign-in-link.use-case';
import { Button } from '@/components/button'

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Get the current URL to use as the redirect URL, but use the auth/confirm page
      const redirectUrl = `${window.location.origin}/auth/confirm`;
      
      localStorage.setItem('emailForSignIn', email);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Email saved to localStorage from LoginForm: ${email}`);
        console.log(`Redirect URL: ${redirectUrl}`);
      }
      
      try {
        // Get the use case from the container
        const sendSignInLinkUseCase = container.get<SendSignInLinkUseCase>(
          Register.auth.useCase.SendSignInLinkUseCase
        );

        // Execute the use case
        const result = await sendSignInLinkUseCase.execute({
          email,
          redirectUrl,
        });

        if (result.success) {
          setMessage({
            text: 'Check your email! We sent you a sign-in link.',
            type: 'success',
          });
          // Clear the form
          setEmail('');
        } else {
          setMessage({
            text: 'Failed to send sign-in link. Please try again.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error getting SendSignInLinkUseCase:', error);
        setMessage({
          text: 'Service unavailable. Please try again later.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Acessar Plataforma</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o seu email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Enviando...' : 'Clique para receber o link'}
        </Button>
      </form>
      
      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
        Enviaremos um link para o seu email.
      </p>
    </div>
  );
}
