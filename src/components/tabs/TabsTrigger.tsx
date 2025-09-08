'use client';

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useThemeColors";

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { primaryColor, secondaryColor } = useThemeColors();

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground hover:text-foreground/80 cursor-pointer",
        // Estados base
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all",
        // Estados de foco
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // Estados desabilitado
        "disabled:pointer-events-none disabled:opacity-50",
        // Ícones
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Estado inativo
        // Estado ativo - usa as cores do tema
        "data-[state=active]:bg-primary data-[state=active]:shadow-sm",
        className
      )}
      style={{
        // Fallback caso as CSS custom properties não estejam definidas
        ...(primaryColor && {
          '--primary': primaryColor,
          '--primary-foreground': secondaryColor || '#ffffff',
        } as React.CSSProperties),
      }}
      {...props}
    />
  );
}

export { TabsTrigger };
