import React, { useState } from "react";
import { Button } from '@/components/button'

type DropdownModalProps = {
  children: React.ReactNode;
  content: React.ReactNode;
}

export function DropdownModal({
  children,
  content
}: DropdownModalProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  // Handle close modal
  const handleClose = () => {
    setIsOpen(false);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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

  return (
    <>
      <ClickableWrapper>{children}</ClickableWrapper>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        >
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
            <div className="p-6">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
