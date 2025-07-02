import * as React from "react";
import Link from "next/link";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface CardSubjectProps {
  title: string;
  description?: string;
  href: string;
  imageUrl?: string;
  isBlocked?: boolean;
  className?: string;
}

export function CardSubject({
  title,
  href,
  imageUrl = "/vercel.svg",
  isBlocked = false,
  className,
}: CardSubjectProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={href}
      className="block no-underline group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "relative overflow-hidden h-80 w-full",
        "border-2 border-transparent hover:border-blue-400/30",
        "transform-gpu will-change-transform",
        className
      )}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          {imageUrl && (
            <div className={cn(
              "relative h-full w-full transition-all duration-700",
              isHovered ? "opacity-80 scale-110" : "opacity-60 scale-100"
            )}>
              <img
                src={imageUrl}
                alt={title || "Course thumbnail image"}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className={cn(
            "absolute inset-0 transition-all duration-500",
            isHovered ? "bg-black/30 bg-gradient-to-t from-black/60 via-transparent to-black/20" : "bg-black/50"
          )} />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6 text-white z-10">
          {/* Title in the middle */}
          <div className="flex-grow flex items-center justify-center">
            <h3 className={cn(
              "text-xl md:text-2xl font-bold text-center uppercase tracking-wider",
              "drop-shadow-lg group-hover:drop-shadow-2xl",
              isHovered && "animate-pulse"
            )}>
              {title}
            </h3>
          </div>

          {/* Hover effect overlay */}

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <svg
                className="w-8 h-8 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/90 animate-fade-in">
              {isBlocked ? "Conteúdo Bloqueado" : "Clique para acessar"}
            </p>
          </div>


          {/* Blocked Status and Logos */}
          {isBlocked && (
            <div>
              <p className={cn(
                "text-center text-sm font-medium transition-all duration-300",
                "group-hover:text-red-200"
              )}>
                Este conteúdo está bloqueado.
              </p>
            </div>
          )}
        </div>

      </Card>
    </Link>
  );
}
