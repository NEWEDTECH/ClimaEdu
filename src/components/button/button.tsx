import { ReactNode } from 'react'
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot";
import { useThemeColors } from "@/hooks/useThemeColors";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  onClick,
  className,
  icon,
  iconPosition = "start",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const { primaryColor, secondaryColor } = useThemeColors();

  return (
    <Comp
      onClick={onClick}
      className={cn(
        "cursor-pointer font-bold",
        "bg-primary text-primary-foreground",
        "text-foreground",
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "start" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "end" && <span className="ml-2">{icon}</span>}
    </Comp>
  );
}
