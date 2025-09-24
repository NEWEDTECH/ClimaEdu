'use client'

import { FilterIcon } from 'lucide-react'
import { TutoringSessionStatus, SessionPriority } from '@/_core/modules/tutoring'
import { TutoringStatusUtils, SessionPriorityUtils, TutoringDateUtils } from '../shared/tutoring-utils'
import { Button } from '@/components/button'
import { SelectComponent } from '@/components/select/select'

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
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border dark:dark:bg-black/10">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
        <FilterIcon size={16} />
        Filtros:
      </div>

      {/* Status Filter */}
      <SelectComponent
        value={statusFilter}
        onChange={(value) => onStatusChange(value as TutoringSessionStatus | 'all')}
        options={statusOptions}
        placeholder="Status"
        className="min-w-[120px]"
      />

      {/* Priority Filter */}
      <SelectComponent
        value={priorityFilter}
        onChange={(value) => onPriorityChange(value as SessionPriority | 'all')}
        options={priorityOptions}
        placeholder="Prioridade"
        className="min-w-[120px]"
      />

      {/* Date Filter */}
      <SelectComponent
        value={dateFilter}
        onChange={(value) => onDateChange(value)}
        options={dateOptions}
        placeholder="Data"
        className="min-w-[120px]"
      />

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
