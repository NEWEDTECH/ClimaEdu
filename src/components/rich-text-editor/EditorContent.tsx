'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

interface EditorContentProps {
  value: string
  onChange: () => void
  onFocus: () => void
  placeholder?: string
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ value, onChange, onFocus, placeholder }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => contentRef.current!, [])

    useEffect(() => {
      if (contentRef.current && contentRef.current.innerHTML !== value) {
        contentRef.current.innerHTML = value
      }
    }, [value])

    const handleInput = () => {
      onChange()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            document.execCommand('bold')
            onChange()
            break
          case 'i':
            e.preventDefault()
            document.execCommand('italic')
            onChange()
            break
          case 'u':
            e.preventDefault()
            document.execCommand('underline')
            onChange()
            break
          case 'z':
            if (e.shiftKey) {
              e.preventDefault()
              document.execCommand('redo')
            } else {
              e.preventDefault()
              document.execCommand('undo')
            }
            onChange()
            break
        }
      }

      // Handle Enter key for better line breaks
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        document.execCommand('insertHTML', false, '<br><br>')
        onChange()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      
      // Get plain text from clipboard
      const text = e.clipboardData.getData('text/plain')
      
      // Insert as plain text to avoid formatting issues
      document.execCommand('insertText', false, text)
      onChange()
    }

    return (
      <div className="relative">
        <div
          ref={contentRef}
          contentEditable
          onInput={handleInput}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="min-h-[200px] p-4 focus:outline-none text-gray-900 leading-relaxed"
          style={{ wordBreak: 'break-word' }}
          suppressContentEditableWarning={true}
        />
        
        {!value && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    )
  }
)

EditorContent.displayName = 'EditorContent'
