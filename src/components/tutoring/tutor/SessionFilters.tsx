'use client'

import { FilterIcon, ChevronDownIcon } from 'lucide-react'

interface SessionFiltersProps {
  statusFilter: string
  priorityFilter: string
  dateFilter: string
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  onDateChange: (date: string) => void
}

export function SessionFilters({
  statusFilter,
  priorityFilter,
  dateFilter,
  onStatusChange,
  onPriorityChange,
  onDateChange
}: SessionFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'scheduled', label: 'Agendadas' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluídas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'no_show', label: 'Faltaram' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'high', label: 'Alta Prioridade' },
    { value: 'medium', label: 'Média Prioridade' },
    { value: 'low', label: 'Baixa Prioridade' }
  ]

  const dateOptions = [
    { value: 'all', label: 'Todas as Datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'upcoming', label: 'Próximas' },
    { value: 'past', label: 'Passadas' }
  ]

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <FilterIcon size={16} />
        Filtros:
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon 
          size={14} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>

      {/* Priority Filter */}
      <div className="relative">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon 
          size={14} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>

      {/* Date Filter */}
      <div className="relative">
        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon 
          size={14} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>

      {/* Clear Filters */}
      {(statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all') && (
        <button
          onClick={() => {
            onStatusChange('all')
            onPriorityChange('all')
            onDateChange('all')
          }}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
