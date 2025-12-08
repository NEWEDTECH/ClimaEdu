'use client';

import React, { useState } from 'react';
import { Editor } from 'primereact/editor';
import { Button } from '@/components/button'

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
    
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    if (textContent && !loading) {
      onSubmit(content);
      setContent('');
      setIsFocused(false);
    }
  };

  const textContent = content.replace(/<[^>]*>/g, '');
  const isValid = textContent.trim().length > 0;
  const remainingChars = maxLength - textContent.length;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="relative">
        <Editor
          value={content}
          onTextChange={(e) => setContent(e.htmlValue || '')}
          onFocus={() => setIsFocused(true)}
          style={{ height: isFocused || content ? '200px' : '100px' }}
          placeholder={placeholder}
        />
      </div>

      {/* Actions */}
      {(isFocused || content) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {textContent.length}/{maxLength} caracteres
            </span>
          </div>
          
          <div className="flex gap-2">
            {content && (
              <Button
              variant='secondary'
                type="button"
                onClick={() => {
                  setContent('');
                  setIsFocused(false);
                }}
                className="px-3 py-1.5 text-sm  transition-colors"
              >
                Cancelar
              </Button>
            )}
            <Button
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
            </Button>
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
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {placeholder}
      </Button>
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
