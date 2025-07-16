'use client'

import { useEffect, useRef } from 'react'

interface ColorPickerProps {
  onColorSelect: (color: string) => void
  onClose: () => void
}

export function ColorPicker({ onColorSelect, onClose }: ColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#FFFF00', '#99FF00', '#00FF00',
    '#00FFCC', '#00CCFF', '#0066FF', '#0000FF', '#6600FF', '#CC00FF',
    '#FF0099', '#FF3366', '#FF6699', '#FF99CC', '#FFCCFF', '#CCCCFF',
    '#99CCFF', '#66CCFF', '#33CCFF', '#00CCFF', '#00FFFF', '#66FFCC',
    '#99FFCC', '#CCFFCC', '#CCFF99', '#CCFF66', '#CCFF33', '#CCFF00'
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="bg-white border border-gray-300 rounded-md shadow-lg p-3 w-48"
    >
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-700 mb-2">Cor do Texto</p>
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-2">
        <p className="text-sm font-medium text-gray-700 mb-2">Cor Personalizada</p>
        <input
          type="color"
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          title="Escolher cor personalizada"
        />
      </div>

      <div className="border-t border-gray-200 pt-2 mt-2">
        <button
          onClick={() => onColorSelect('#000000')}
          className="w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          Remover cor
        </button>
      </div>
    </div>
  )
}
