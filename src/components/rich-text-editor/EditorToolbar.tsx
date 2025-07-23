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

  if (!isVisible) return null

  const handleColorChange = (color: string) => {
    onCommand('foreColor', color)
    setShowColorPicker(false)
  }

  const handleLinkClick = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      
      // Verifica se o texto já é uma URL válida
      let url = selectedText
      if (!selectedText.startsWith('http://') && !selectedText.startsWith('https://')) {
        // Se não é uma URL, adiciona https:// no início
        if (selectedText.includes('.') && !selectedText.includes(' ')) {
          // Parece ser um domínio (ex: google.com)
          url = 'https://' + selectedText
        } else {
          // Texto comum, transforma em busca no Google
          url = 'https://www.google.com/search?q=' + encodeURIComponent(selectedText)
        }
      }
      
      // Transforma o texto selecionado em link
      onCommand('createLink', url)
    } else {
      // Se não há texto selecionado, alerta o usuário
      alert('Selecione o texto que deseja transformar em link primeiro.')
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
        <ToolbarButton
          onClick={handleLinkClick}
          title="Transformar texto selecionado em link"
        >
          <LinkIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Font size */}
        <select
          onChange={(e) => onCommand('fontSize', e.target.value)}
          defaultValue="3"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Tamanho da fonte"
        >
          <option value="1">Muito pequeno</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Muito grande</option>
          <option value="7">Gigante</option>
        </select>
      </div>
    </div>
  )
}
