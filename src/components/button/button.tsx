import { ReactNode } from 'react'
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot";

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

  return (
    <Comp
      onClick={onClick}
      className={cn(
        "cursor-pointer font-bold",
        "inline-flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20",
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
