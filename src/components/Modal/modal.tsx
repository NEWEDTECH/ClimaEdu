import React, { useState } from "react";

interface DropdownModalProps {
  children: React.ReactNode;
  content: React.ReactNode;
  id?: string;
}

export function DropdownModal({
  children,
  content,
  id: propId,
}: DropdownModalProps) {
  // Generate a unique ID if not provided
  const [id] = useState(() => propId || `modal-${Math.random().toString(36).substr(2, 9)}`);
  
  // Use the modal context
  const [openModal, setOpenmodal] = useState<any>(false)

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(id, content);
  };

  // Create a wrapper component that handles the click event
  const ClickableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <span 
        onClick={handleClick} 
        style={{ cursor: "pointer", display: "inline" }}
      >
        {children}
      </span>
    );
  };

  return <ClickableWrapper>{children}</ClickableWrapper>;
}
