'use client';

import React, { useState } from 'react';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LikeButton({
  isLiked,
  likesCount,
  onLike,
  size = 'md',
  showCount = true,
  disabled = false,
  className = ''
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Call the like handler
    onLike();
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 transition-all duration-200 
        ${isLiked 
          ? 'text-red-600 dark:text-red-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${textSizeClasses[size]}
        ${className}
      `}
      aria-label={isLiked ? 'Descurtir' : 'Curtir'}
    >
      {/* Heart Icon with Animation */}
      <div className="relative">
        <svg 
          className={`
            ${sizeClasses[size]} 
            transition-all duration-200
            ${isLiked ? 'fill-current scale-110' : 'fill-none'}
            ${isAnimating ? 'animate-pulse scale-125' : ''}
          `}
          fill={isLiked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        
        {/* Animation particles */}
        {isAnimating && isLiked && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-12px)`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      {showCount && (
        <span className={`
          font-medium transition-all duration-200
          ${isAnimating ? 'scale-110' : ''}
        `}>
          {likesCount}
        </span>
      )}
    </button>
  );
}

// Compact version for inline use
export function LikeButtonCompact({
  isLiked,
  likesCount,
  onLike,
  disabled = false
}: Omit<LikeButtonProps, 'size' | 'showCount' | 'className'>) {
  return (
    <LikeButton
      isLiked={isLiked}
      likesCount={likesCount}
      onLike={onLike}
      size="sm"
      disabled={disabled}
      className="hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md"
    />
  );
}

// Like button with tooltip
export function LikeButtonWithTooltip({
  isLiked,
  likesCount,
  onLike,
  disabled = false
}: LikeButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTooltipText = () => {
    if (likesCount === 0) return 'Seja o primeiro a curtir';
    if (likesCount === 1) return isLiked ? 'Você curtiu' : '1 pessoa curtiu';
    if (isLiked) {
      return likesCount === 2 
        ? 'Você e 1 pessoa curtiram'
        : `Você e ${likesCount - 1} pessoas curtiram`;
    }
    return `${likesCount} pessoas curtiram`;
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <LikeButton
        isLiked={isLiked}
        likesCount={likesCount}
        onLike={onLike}
        disabled={disabled}
      />
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
}
