import React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "p" | "blockquote"
}

export function Typography({ variant = "p", className, ...props }: TypographyProps) {
  const Component = variant as React.ElementType
  const baseClasses = {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    blockquote: "mt-6 border-l-2 pl-6 italic",
  }

  return (
    <Component className={cn(baseClasses[variant], className)} {...props} />
  )
}
