'use client'

import { ClockIcon } from 'lucide-react'

interface TimeSlotPickerProps {
  availableSlots: string[]
  selectedTime: string
  onTimeChange: (time: string) => void
  disabled?: boolean
  error?: string
}

export function TimeSlotPicker({ 
  availableSlots, 
  selectedTime, 
  onTimeChange, 
  disabled = false,
  error 
}: TimeSlotPickerProps) {
  // Mock function to simulate checking if a time slot is already booked
  const isTimeSlotBooked = (time: string) => {
    // Simulate some booked slots
    const bookedSlots = ['10:00', '14:30', '16:00']
    return bookedSlots.includes(time)
  }

  const formatTimeDisplay = (time: string) => {
    return time
  }

  return (
    <div className="space-y-2">
      <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {availableSlots.map((time) => {
          const isBooked = isTimeSlotBooked(time)
          const isSelected = selectedTime === time
          
          return (
            <button
              key={time}
              type="button"
              onClick={() => !isBooked && onTimeChange(time)}
              disabled={disabled || isBooked}
              className={`
                flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors
                ${isSelected 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : isBooked
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              <ClockIcon size={12} />
              {formatTimeDisplay(time)}
            </button>
          )
        })}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Ocupado</span>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
