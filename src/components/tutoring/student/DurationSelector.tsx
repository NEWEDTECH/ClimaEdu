'use client'

import { ClockIcon } from 'lucide-react'

interface DurationOption {
  value: number
  label: string
  description: string
}

const DURATION_OPTIONS: DurationOption[] = [
  { value: 30, label: '30 min', description: 'Sessão rápida' },
  { value: 60, label: '1 hora', description: 'Sessão padrão' },
  { value: 90, label: '1h 30min', description: 'Sessão estendida' },
  { value: 120, label: '2 horas', description: 'Sessão longa' }
]

interface DurationSelectorProps {
  selectedDuration: number
  onDurationChange: (duration: number) => void
  disabled?: boolean
}

export function DurationSelector({
  selectedDuration,
  onDurationChange,
  disabled = false
}: DurationSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <ClockIcon size={16} />
        Duração da Sessão
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {DURATION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onDurationChange(option.value)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedDuration === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-sm'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-gray-500 mt-1">
              {option.description}
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        Selecione a duração desejada para sua sessão de tutoria
      </p>
    </div>
  )
}
