'use client';

import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
}

export function CommentForm({
  onSubmit,
  loading = false,
  placeholder = 'Adicione um comentário...',
  maxLength = 1000,
  autoFocus = false,
  className = ''
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim() && !loading) {
      onSubmit(content.trim());
      setContent('');
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isValid = content.trim().length > 0;
  const remainingChars = maxLength - content.length;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !content.trim() && setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            bg-white dark:bg-gray-700 
            border-gray-300 dark:border-gray-600
            text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            ${isFocused || content ? 'min-h-[100px]' : 'min-h-[60px]'}
          `}
          rows={isFocused || content ? 4 : 2}
        />
        
        {/* Character count */}
        {(isFocused || content) && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
            {remainingChars < 100 && (
              <span className={remainingChars < 0 ? 'text-red-500' : 'text-yellow-500'}>
                {remainingChars}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {(isFocused || content) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}/{maxLength} caracteres
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Ctrl+Enter para enviar
            </span>
          </div>
          
          <div className="flex gap-2">
            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setIsFocused(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!isValid || loading || remainingChars < 0}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Comentar'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// Compact version for inline use
export function CommentFormCompact({
  onSubmit,
  loading = false,
  placeholder = 'Comentar...'
}: Pick<CommentFormProps, 'onSubmit' | 'loading' | 'placeholder'>) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <CommentForm
      onSubmit={(content) => {
        onSubmit(content);
        setIsExpanded(false);
      }}
      loading={loading}
      placeholder={placeholder}
      autoFocus
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
    />
  );
}

// Form with user avatar
export function CommentFormWithAvatar({
  onSubmit,
  loading = false,
  currentUserName = 'Usuário',
  placeholder = 'Adicione um comentário...'
}: CommentFormProps & { currentUserName?: string }) {
  return (
    <div className="flex gap-3">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {currentUserName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Comment Form */}
      <div className="flex-1">
        <CommentForm
          onSubmit={onSubmit}
          loading={loading}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
