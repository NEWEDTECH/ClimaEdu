'use client'

import { CalendarIcon } from 'lucide-react'

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
  error?: string
}

export function DatePicker({ selectedDate, onDateChange, error }: DatePickerProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Get date 3 months from now for max date
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateString = maxDate.toISOString().split('T')[0]

  // Check if selected date is a weekend
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday = 0, Saturday = 6
  }

  const handleDateChange = (dateString: string) => {
    if (isWeekend(dateString)) {
      return // Don't allow weekend selection
    }
    onDateChange(dateString)
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={today}
          max={maxDateString}
          className={`
            flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm 
            transition-colors focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2
            ${error ? 'border-red-500' : 'border-input'}
          `}
        />
        <CalendarIcon 
          size={16} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
      
      {selectedDate && isWeekend(selectedDate) && (
        <p className="text-amber-600 text-xs mt-1">
          Sessões de tutoria não estão disponíveis nos fins de semana
        </p>
      )}
      
      <p className="text-gray-500 text-xs mt-1">
        Disponível de segunda a sexta-feira, até 3 meses à frente
      </p>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
