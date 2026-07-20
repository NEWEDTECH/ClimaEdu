import { ScheduledClass } from '@/_core/modules/scheduled-class'

/**
 * Date/time formatting utilities for scheduled classes
 */
export const ScheduledClassDateUtils = {
  formatDate: (date: Date): string =>
    date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),

  formatTime: (date: Date): string =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),

  formatDateTime: (date: Date): string =>
    `${date.toLocaleDateString('pt-BR')} às ${ScheduledClassDateUtils.formatTime(date)}`,

  /**
   * Converts a Date to the values expected by <input type="date"> and <input type="time">
   */
  toInputValues: (date: Date): { date: string; time: string } => {
    const pad = (value: number) => String(value).padStart(2, '0')
    return {
      date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  },

  /**
   * Builds a Date from <input type="date"> and <input type="time"> values (local timezone)
   */
  fromInputValues: (date: string, time: string): Date => new Date(`${date}T${time}`)
}

/**
 * Meeting platform utilities
 */
export const MeetingPlatformUtils = {
  getPlatform: (url: string): string => {
    if (url.includes('meet.google')) return 'Google Meet'
    if (url.includes('zoom.us')) return 'Zoom'
    if (url.includes('teams.microsoft')) return 'Microsoft Teams'
    return 'Reunião online'
  },

  isValidUrl: (url: string): boolean => /^https?:\/\/.+/.test(url.trim())
}

/**
 * Display utilities for scheduled class status
 */
export const ScheduledClassStatusUtils = {
  getLabel: (scheduledClass: ScheduledClass): string => {
    if (scheduledClass.isCancelled()) return 'Cancelada'
    if (scheduledClass.hasOccurred()) return 'Realizada'
    return 'Agendada'
  },

  getColor: (scheduledClass: ScheduledClass): string => {
    if (scheduledClass.isCancelled()) return 'bg-red-100 text-red-800 border-red-200'
    if (scheduledClass.hasOccurred()) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}
