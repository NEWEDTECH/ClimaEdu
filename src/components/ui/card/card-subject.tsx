import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "./card";

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
  description,
  href,
  imageUrl = "/vercel.svg",
  isBlocked = false,
  className,
}: CardSubjectProps) {
  return (
    <Link href={href} className="block no-underline">
      <Card className={`relative overflow-hidden h-80 w-full ${className}`}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          {imageUrl && (
            <div className="relative h-full w-full opacity-60">
              <Image 
                src={imageUrl} 
                alt={title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6 text-white z-10">
          {/* Title in the middle */}
          <div className="flex-grow flex items-center justify-center">
            <h3 className="text-xl md:text-2xl font-bold text-center uppercase tracking-wider">
              {title}
            </h3>
          </div>
          
          {/* Blocked Status and Logos */}
          {isBlocked && (
            <div className="mt-auto">
              <div className="flex justify-center space-x-4 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
              <p className="text-center text-sm font-medium">
                Este conteúdo está bloqueado.
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

// Mock data for subjects
export const mockSubjects = [
  {
    id: 1,
    title: "Introdução ao Curso",
    href: "/student/contents/introducao",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 2,
    title: "Fundamentos de Programação",
    href: "/student/contents/fundamentos",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 3,
    title: "Desenvolvimento Web",
    href: "/student/contents/web",
    imageUrl: "/vercel.svg",
    isBlocked: false,
  },
  {
    id: 4,
    title: "Banco de Dados",
    href: "/student/contents/database",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 5,
    title: "Arquitetura de Software",
    href: "/student/contents/arquitetura",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 6,
    title: "DevOps e CI/CD",
    href: "/student/contents/devops",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 7,
    title: "Inteligência Artificial",
    href: "/student/contents/ai",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 8,
    title: "Segurança da Informação",
    href: "/student/contents/seguranca",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 9,
    title: "Mobile Development",
    href: "/student/contents/mobile",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
  {
    id: 10,
    title: "Projeto Final",
    href: "/student/contents/projeto-final",
    imageUrl: "/vercel.svg",
    isBlocked: true,
  },
];
