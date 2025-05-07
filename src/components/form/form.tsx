import { ReactNode, FormEventHandler } from "react";
import { cn } from "@/lib/utils"; // ou use clsx se preferir

type FormSectionProps = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  error?: string | null;
  className?: string;
};

export function FormSection({
  children,
  onSubmit,
  error,
  className,
}: FormSectionProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {children}
    </form>
  );
}
