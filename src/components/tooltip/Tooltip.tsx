'use client';

import React from 'react';

type TooltipProps = {
  label: string;
  className?: string;
};

export function Tooltip({ label, className = '' }: TooltipProps) {
  return (
    <div className={`inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mr-2 mb-2 ${className}`}>
      <span>{label}</span>
    </div>
  );
}
