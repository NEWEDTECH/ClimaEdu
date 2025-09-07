'use client';

import { useEffect } from 'react';

interface AutoNavigationModalProps {
  isOpen: boolean;
  countdown: number;
  isNavigating: boolean;
  onCancel: () => void;
  onProceed: () => void;
}

export function AutoNavigationModal({
  isOpen,
  countdown,
  isNavigating,
  onCancel,
  onProceed
}: AutoNavigationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-in zoom-in-95 fade-in duration-300">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-2">
            Vídeo Concluído!
          </h3>

          {/* Message */}
          <div className="mb-6">
            {isNavigating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Carregando próxima lição...
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Parabéns! Você concluiu esta lição com sucesso.
                </p>
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                  Indo para a próxima lição em <span className="text-2xl font-bold">{countdown}</span>s
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          {!isNavigating && (
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={onProceed}
              >
                Ir Agora
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${100 - (countdown / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}