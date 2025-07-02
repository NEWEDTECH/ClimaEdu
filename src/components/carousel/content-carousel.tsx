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

  if (items.length === 0) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md",
        className
      )}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <p className="text-center text-gray-500 animate-pulse">{emptyMessage}</p>
      </div>
    );
  }

  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md",
        className
      )}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <div>
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
      "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md",
      className
    )}>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        {title}
      </h2>
      <div className="relative group">
        <Carousel 
          className={cn(
            "w-full transition-all duration-300",
          )}
        >
          <CarouselContent className="transition-transform duration-500 ease-out">
            {items.map((item, index) => (
              <CarouselItem 
                key={item.id} 
                className={cn(
                  "md:basis-1/2 lg:basis-1/3 pl-4",
                  itemClassName
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "600ms"
                }}
              >
                <div className="group/item h-full">
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
              "left-2 transition-all duration-300",
            )}
          />
          <CarouselNext 
            className={cn(
              "right-2 transition-all duration-300",
            )}
          />
        </Carousel>
        
      </div>
    </div>
  );
}
