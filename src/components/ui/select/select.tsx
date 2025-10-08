"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/button/dropdown';

type DropdownProps = {
  children: React.ReactNode;
  className?: string;
}

function Dropdown({
  children,
  className
}: DropdownProps) {
  // Split children into trigger and content
  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(
    (child) => React.isValidElement(child) && child.type !== DropdownMenuContent
  );
  const content = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === DropdownMenuContent
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={className}>
        {trigger}
      </DropdownMenuTrigger>
      {content}
    </DropdownMenu>
  )
}

export { Dropdown, DropdownMenuContent, DropdownMenuItem}
