'use client'

import { FilterIcon, ChevronDownIcon } from 'lucide-react'
import { TutoringSessionStatus, SessionPriority } from '@/_core/modules/tutoring'
import { TutoringStatusUtils, SessionPriorityUtils, TutoringDateUtils } from '../shared/tutoring-utils'
import { Button } from '@/components/button'

interface SessionFiltersProps {
  statusFilter: TutoringSessionStatus | 'all'
  priorityFilter: SessionPriority | 'all'
  dateFilter: string
  onStatusChange: (status: TutoringSessionStatus | 'all') => void
  onPriorityChange: (priority: SessionPriority | 'all') => void
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
  const statusOptions = TutoringStatusUtils.getAllOptions()
  const priorityOptions = SessionPriorityUtils.getAllOptions()
  const dateOptions = TutoringDateUtils.getDateFilterOptions()

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
          onChange={(e) => onStatusChange(e.target.value as TutoringSessionStatus | 'all')}
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
          onChange={(e) => onPriorityChange(e.target.value as SessionPriority | 'all')}
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
        <Button
          onClick={() => {
            onStatusChange('all')
            onPriorityChange('all')
            onDateChange('all')
          }}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
