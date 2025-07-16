'use client'

import { useState } from 'react'
import { ToolbarButton } from './ToolbarButton'
import { ColorPicker } from './ColorPicker'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  ListIcon, 
  ListOrderedIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  LinkIcon,
  PaletteIcon
} from 'lucide-react'

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void
  isVisible: boolean
}

export function EditorToolbar({ onCommand, isVisible }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false)
  const [linkUrl, setLinkUrl] = useState<string>('')

  if (!isVisible) return null

  const handleColorChange = (color: string) => {
    onCommand('foreColor', color)
    setShowColorPicker(false)
  }

  const handleLinkInsert = () => {
    if (linkUrl.trim()) {
      onCommand('createLink', linkUrl)
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const formatButtons = [
    { command: 'bold', icon: BoldIcon, title: 'Negrito (Ctrl+B)' },
    { command: 'italic', icon: ItalicIcon, title: 'Itálico (Ctrl+I)' },
    { command: 'underline', icon: UnderlineIcon, title: 'Sublinhado (Ctrl+U)' },
  ]

  const listButtons = [
    { command: 'insertUnorderedList', icon: ListIcon, title: 'Lista com marcadores' },
    { command: 'insertOrderedList', icon: ListOrderedIcon, title: 'Lista numerada' },
  ]

  const alignButtons = [
    { command: 'justifyLeft', icon: AlignLeftIcon, title: 'Alinhar à esquerda' },
    { command: 'justifyCenter', icon: AlignCenterIcon, title: 'Centralizar' },
    { command: 'justifyRight', icon: AlignRightIcon, title: 'Alinhar à direita' },
  ]

  return (
    <div className="bg-gray-50 border-b border-gray-300 p-2">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Format buttons */}
        <div className="flex items-center gap-1 mr-2">
          {formatButtons.map(({ command, icon: Icon, title }) => (
            <ToolbarButton
              key={command}
              onClick={() => onCommand(command)}
              title={title}
            >
              <Icon size={16} />
            </ToolbarButton>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* List buttons */}
        <div className="flex items-center gap-1 mr-2">
          {listButtons.map(({ command, icon: Icon, title }) => (
            <ToolbarButton
              key={command}
              onClick={() => onCommand(command)}
              title={title}
            >
              <Icon size={16} />
            </ToolbarButton>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Alignment buttons */}
        <div className="flex items-center gap-1 mr-2">
          {alignButtons.map(({ command, icon: Icon, title }) => (
            <ToolbarButton
              key={command}
              onClick={() => onCommand(command)}
              title={title}
            >
              <Icon size={16} />
            </ToolbarButton>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Color picker */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Cor do texto"
          >
            <PaletteIcon size={16} />
          </ToolbarButton>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-10">
              <ColorPicker
                onColorSelect={handleColorChange}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Link button */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkDialog(!showLinkDialog)}
            title="Inserir link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>

          {showLinkDialog && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg p-3 min-w-[250px]">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  URL do Link
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleLinkInsert()
                    } else if (e.key === 'Escape') {
                      setShowLinkDialog(false)
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLinkDialog(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLinkInsert}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Inserir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Font size */}
        <select
          onChange={(e) => onCommand('fontSize', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Tamanho da fonte"
        >
          <option value="1">Muito pequeno</option>
          <option value="2">Pequeno</option>
          <option value="3" selected>Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Muito grande</option>
          <option value="7">Gigante</option>
        </select>
      </div>
    </div>
  )
}
