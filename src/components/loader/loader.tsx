import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center bg-background/80 z-50", className)}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
