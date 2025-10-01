'use client'

import { useState, useRef, useCallback } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { EditorContent } from './EditorContent'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    
    // Update the content after command execution
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }, [onChange])

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }, [onChange])

  const handleFocus = useCallback(() => {
    setIsToolbarVisible(true)
  }, [])

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className || ''}`}>
      <EditorToolbar
        onCommand={handleCommand}
        isVisible={isToolbarVisible}
      />
      
      <EditorContent
        ref={editorRef}
        value={value}
        onChange={handleContentChange}
        onFocus={handleFocus}
        placeholder={placeholder}
      />
    </div>
  )
}
