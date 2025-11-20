import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Play, Lock, BookOpen, Headphones, TrendingUp } from "lucide-react";
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import type { GetCourseProgressUseCase } from '@/_core/modules/content';

interface CardSubjectProps {
  title: string;
  description?: string;
  href: string;
  imageUrl?: string;
  isBlocked?: boolean;
  className?: string;
  courseId?: string;
  userId?: string;
  institutionId?: string;
}

export function CardSubject({
  title,
  href,
  imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
  isBlocked = false,
  className,
  courseId,
  userId,
  institutionId,
}: CardSubjectProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Add cache-busting parameter to image URL to prevent browser caching issues
  const getCacheBustedImageUrl = (url: string): string => {
    if (!url) return url;
    
    // Don't add cache-busting to external URLs (like unsplash)
    if (!url.includes('firebasestorage.googleapis.com')) {
      return url;
    }
    
    // Add timestamp as query parameter to force browser to fetch new image
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  // Load course progress
  useEffect(() => {
    const loadProgress = async () => {

      if (!courseId || !userId || !institutionId) {

        setLoading(false);
        return;
      }

      try {

        const useCase = container.get<GetCourseProgressUseCase>(
          Register.content.useCase.GetCourseProgressUseCase
        );

        const result = await useCase.execute({
          courseId,
          userId,
          institutionId
        });

        setProgressPercentage(result.progressPercentage);
      } catch (error) {
        console.log(error)
        setProgressPercentage(0);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [courseId, userId, institutionId, title]);

  // Determine content type based on href for appropriate icon
  const getContentIcon = () => {
    if (href.includes('/podcast/')) return Headphones;
    if (href.includes('/trails/')) return TrendingUp;
    return BookOpen;
  };

  const ContentIcon = getContentIcon();

  return (
    <Link
      href={isBlocked ? '#' : href}
      className={cn(
        "block no-underline group relative",
        isBlocked && "cursor-not-allowed"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isBlocked) {
          e.preventDefault();
        }
      }}
    >
      <div className={cn(
        "streaming-card aspect-[2/3] w-full",
        "bg-gradient-to-br from-slate-800 to-slate-900",
        "border border-white/10 transition-all duration-500",
        "shadow-lg hover:shadow-2xl hover:shadow-purple-500/20",
        !isBlocked && "hover:border-purple-400/50 hover:scale-[1.02]",
        isBlocked && "opacity-60",
        className
      )}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getCacheBustedImageUrl(imageUrl)}
            alt={title || "Content thumbnail"}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isHovered && !isBlocked ? "scale-110 brightness-110" : "scale-100 brightness-75"
            )}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop";
            }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className={cn(
            "absolute inset-0 transition-all duration-500",
            isHovered && !isBlocked 
              ? "bg-gradient-to-t from-purple-900/60 via-transparent to-blue-900/30" 
              : "bg-black/30"
          )} />
        </div>

        {/* Content Type Icon */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/20">
            <ContentIcon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Blocked Icon */}
        {isBlocked && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-2 border border-red-400/50">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Play Button - Only show on hover for non-blocked content */}
        {!isBlocked && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center z-10 transition-all duration-300",
            isHovered ? "opacity-100 scale-100 animate-float" : "opacity-0 scale-75"
          )}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 hover:bg-white/30 transition-all duration-200 hover:animate-glow">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="space-y-2">
            <h3 className={cn(
              "text-white font-bold text-lg leading-tight line-clamp-2",
              "drop-shadow-lg transition-all duration-300 animate-fade-in",
              isHovered && !isBlocked && "gradient-text-purple"
            )}>
              {title}
            </h3>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-between">
              <div className={cn(
                "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                isBlocked 
                  ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                  : "bg-green-500/20 text-green-300 border border-green-500/30"
              )}>
                {isBlocked ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Bloqueado</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Disponível</span>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {!isBlocked && !loading && (
                <div className="flex-1 ml-3">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                      title={`${progressPercentage}% concluído`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        {!isBlocked && (
          <div className={cn(
            "absolute inset-0 rounded-xl transition-all duration-500 pointer-events-none",
            isHovered 
              ? "shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/50" 
              : "shadow-none"
          )} />
        )}
      </div>
    </Link>
  );
}
