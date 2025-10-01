import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "../ui/carousel/carousel";
import { CardSubject } from "../ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface ContentItem {
  id: string;
  title: string;
  href: string;
  imageUrl?: string;
  isBlocked?: boolean;
}

interface ContentCarouselProps {
  items: ContentItem[];
  title: string;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
  singleItemClassName?: string;
}

export function ContentCarousel({
  items,
  title,
  emptyMessage = "Nenhum conteúdo disponível.",
  className = "",
  itemClassName = "",
  singleItemClassName = "w-[400px]"
}: ContentCarouselProps) {
  const { isDarkMode } = useTheme();

  if (items.length === 0) {
    return (
      <div className={cn(
        "bg-transparent p-0",
        className
      )}>
        {title && (
          <h2 className={`text-2xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {title}
          </h2>
        )}
        <div className="text-center py-12">
          <p className={`text-lg animate-pulse ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={cn(
        "bg-transparent p-0",
        className
      )}>
        {title && (
          <h2 className={`text-2xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {title}
          </h2>
        )}
        <div className="flex">
          <CardSubject
            className={cn(
              singleItemClassName,
            )}
            title={item.title}
            href={item.href}
            imageUrl={item.imageUrl}
            isBlocked={item.isBlocked}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-transparent p-0",
      className
    )}>
      {title && (
        <h2 className={`text-2xl font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h2>
      )}
      <div className="relative group">
        <Carousel 
          className={cn(
            "w-full transition-all duration-300",
          )}
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent className="transition-transform duration-500 ease-out -ml-2 md:-ml-4">
            {items.map((item, index) => (
              <CarouselItem 
                key={item.id} 
                className={cn(
                  "pl-2 md:pl-4 basis-[280px] sm:basis-[320px] md:basis-[360px] lg:basis-[400px]",
                  itemClassName
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "600ms"
                }}
              >
                <div className="group/item h-full transform transition-all duration-300 hover:scale-105">
                  <CardSubject
                    title={item.title}
                    href={item.href}
                    imageUrl={item.imageUrl}
                    isBlocked={item.isBlocked}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious 
            className={cn(
              "left-2 transition-all duration-300 opacity-0 group-hover:opacity-100",
              isDarkMode 
                ? "bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white" 
                : "bg-white/90 border-gray-200/50 text-gray-800 hover:bg-white hover:text-gray-900 shadow-lg"
            )}
          />
          <CarouselNext 
            className={cn(
              "right-2 transition-all duration-300 opacity-0 group-hover:opacity-100",
              isDarkMode 
                ? "bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white" 
                : "bg-white/90 border-gray-200/50 text-gray-800 hover:bg-white hover:text-gray-900 shadow-lg"
            )}
          />
        </Carousel>
        
      </div>
    </div>
  );
}
