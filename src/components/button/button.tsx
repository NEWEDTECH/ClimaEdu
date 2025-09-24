import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { useThemeColors } from "@/hooks/useThemeColors";

type ButtonProps = {
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  onClick,
  className,
  icon,
  iconPosition = "start",
  asChild = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const { primaryColor, secondaryColor } = useThemeColors();

  console.log(primaryColor, secondaryColor)

  const base =
    "cursor-pointer flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 gap-1.5 px-3 w-auto";

  const variants = {
    primary: "bg-primary text-foreground shadow-sm hover:bg-primary/90",
    secondary:
      "bg-transparent text-foreground shadow-sm hover:bg-transparent/80",
    ghost:
      "bg-transparent hover:bg-accent hover:text-accent-foreground shadow-none",
  };

  return (
    <Comp
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {icon && iconPosition === "start" && (
        <span className="flex items-center">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "end" && (
        <span className="flex items-center">{icon}</span>
      )}
    </Comp>
  );
}
