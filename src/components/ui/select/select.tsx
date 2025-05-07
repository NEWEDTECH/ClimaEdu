"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/button/dropdown';

type DropdownMenuProps = {
  children: React.ReactNode;
  className: string;
}

function Dropdown({
  children,
  className
}: DropdownMenuProps) {
  return (
    <>
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={className}>
        {children}
      </DropdownMenuTrigger>
    </DropdownMenu>
    </>
  )
}

export { Dropdown, DropdownMenuContent, DropdownMenuItem}
