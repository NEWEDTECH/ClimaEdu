"use client";

import React from 'react';
import Link from 'next/link';
import { DropdownMenuItem } from '@/components/ui/button/dropdown';
import { OptionsProfileProps } from '@/types/profile';

export function ProfileDropdownOptions({
  label,
  href,
  icon,
}: OptionsProfileProps) {

  return (
    <DropdownMenuItem asChild>
      <Link href={href} className="flex items-center gap-2 cursor-pointer">
        <span className="w-4 h-4 text-muted-foreground flex items-center justify-center">
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}
