'use client';

import { useState, useCallback } from 'react';
import { SocialPost } from '@/context/zustand/useSocialStore';

interface ShareButtonProps {
  post: SocialPost;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: (post: SocialPost) => void;
  color: string;
}

export function ShareButton({ 
  post, 
  className = '', 
  showLabel = false,
  size = 'md' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  // Generate share URL
  const getShareUrl = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/social/post/${post.id}`;
  }, [post.id]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getShareUrl]);

  // Share options
  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      name: 'Copiar link',
      icon: (
        <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: copyToClipboard,
      color: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
        </svg>
      ),
      action: (post) => {
        const text = encodeURIComponent(`Confira este post: "${post.title}"`);
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
      },
      color: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      action: (post) => {
        const text = encodeURIComponent(`Confira este post: "${post.title}"`);
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      },
      color: 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      action: (post) => {
        const url = encodeURIComponent(getShareUrl());
        const title = encodeURIComponent(post.title);
        const summary = encodeURIComponent(post.content.substring(0, 200) + '...');
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
      },
      color: 'text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400'
    },
    {
      id: 'email',
      name: 'Email',
      icon: (
        <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      action: (post) => {
        const subject = encodeURIComponent(`Confira este post: ${post.title}`);
        const body = encodeURIComponent(`Olá!\n\nGostaria de compartilhar este post interessante com você:\n\n"${post.title}"\n\n${getShareUrl()}\n\nEspero que goste!`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
      color: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }
  ];

  // Handle click outside to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('[data-share-dropdown]')) {
      setIsOpen(false);
    }
  }, []);

  // Add/remove event listener for click outside
  useState(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div className="relative" data-share-dropdown>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 
          hover:text-gray-900 dark:hover:text-white transition-colors
          ${buttonSizeClasses[size]} ${className}
        `}
        title="Compartilhar"
      >
        <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        {showLabel && <span className="text-sm">Compartilhar</span>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Compartilhar post
            </p>
          </div>
          
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                option.action(post);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-sm
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                ${option.color}
              `}
            >
              {option.icon}
              <span>{option.name}</span>
              {option.id === 'copy' && copied && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                  Copiado!
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified share button for quick actions
export function QuickShareButton({ 
  post, 
  className = '',
  size = 'md' 
}: Omit<ShareButtonProps, 'showLabel'>) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const handleQuickShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/social/post/${post.id}`;
    
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 200) + '...',
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error occurred, fall back to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [post]);

  return (
    <button
      onClick={handleQuickShare}
      className={`
        inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 
        hover:text-blue-600 dark:hover:text-blue-400 transition-colors
        ${buttonSizeClasses[size]} ${className}
      `}
      title={copied ? 'Link copiado!' : 'Compartilhar'}
    >
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400">
          Copiado!
        </span>
      )}
    </button>
  );
}
