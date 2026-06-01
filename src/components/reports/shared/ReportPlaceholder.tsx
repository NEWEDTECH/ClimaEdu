import React from 'react';

type ReportPlaceholderProps = {
  message: string;
};

export function ReportPlaceholder({ message }: ReportPlaceholderProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px] rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}
