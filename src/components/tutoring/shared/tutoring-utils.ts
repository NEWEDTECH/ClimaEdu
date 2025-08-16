import { TutoringSessionStatus, SessionPriority } from '@/_core/modules/tutoring'
import { ClockIcon, CheckCircleIcon, XCircleIcon, PlayIcon } from 'lucide-react'

/**
 * Utilities for TutoringSessionStatus enum
 */
export const TutoringStatusUtils = {
  /**
   * Get human-readable label for status
   */
  getLabel: (status: TutoringSessionStatus): string => {
    switch (status) {
      case TutoringSessionStatus.SCHEDULED:
        return 'Agendada'
      case TutoringSessionStatus.IN_PROGRESS:
        return 'Em Andamento'
      case TutoringSessionStatus.COMPLETED:
        return 'Concluída'
      case TutoringSessionStatus.CANCELLED:
        return 'Cancelada'
      case TutoringSessionStatus.NO_SHOW:
        return 'Faltou'
      default:
        return 'Agendada'
    }
  },

  /**
   * Get CSS classes for status styling
   */
  getColor: (status: TutoringSessionStatus): string => {
    switch (status) {
      case TutoringSessionStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case TutoringSessionStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case TutoringSessionStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200'
      case TutoringSessionStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200'
      case TutoringSessionStatus.NO_SHOW:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  },

  /**
   * Get icon component for status
   */
  getIcon: (status: TutoringSessionStatus) => {
    switch (status) {
      case TutoringSessionStatus.SCHEDULED:
        return ClockIcon
      case TutoringSessionStatus.IN_PROGRESS:
        return PlayIcon
      case TutoringSessionStatus.COMPLETED:
        return CheckCircleIcon
      case TutoringSessionStatus.CANCELLED:
      case TutoringSessionStatus.NO_SHOW:
        return XCircleIcon
      default:
        return ClockIcon
    }
  },

  /**
   * Get all status options for filters
   */
  getAllOptions: (): Array<{ value: TutoringSessionStatus | 'all', label: string }> => [
    { value: 'all', label: 'Todos os Status' },
    { value: TutoringSessionStatus.SCHEDULED, label: TutoringStatusUtils.getLabel(TutoringSessionStatus.SCHEDULED) },
    { value: TutoringSessionStatus.IN_PROGRESS, label: TutoringStatusUtils.getLabel(TutoringSessionStatus.IN_PROGRESS) },
    { value: TutoringSessionStatus.COMPLETED, label: TutoringStatusUtils.getLabel(TutoringSessionStatus.COMPLETED) },
    { value: TutoringSessionStatus.CANCELLED, label: TutoringStatusUtils.getLabel(TutoringSessionStatus.CANCELLED) },
    { value: TutoringSessionStatus.NO_SHOW, label: TutoringStatusUtils.getLabel(TutoringSessionStatus.NO_SHOW) }
  ],

  /**
   * Get grouped status labels for organization
   */
  getGroupLabels: (): Record<TutoringSessionStatus, string> => ({
    [TutoringSessionStatus.SCHEDULED]: 'Agendadas', 
    [TutoringSessionStatus.IN_PROGRESS]: 'Em Andamento',
    [TutoringSessionStatus.COMPLETED]: 'Concluídas',
    [TutoringSessionStatus.CANCELLED]: 'Canceladas',
    [TutoringSessionStatus.NO_SHOW]: 'Faltaram'
  })
}

/**
 * Utilities for SessionPriority enum
 */
export const SessionPriorityUtils = {
  /**
   * Get human-readable label for priority
   */
  getLabel: (priority: SessionPriority): string => {
    switch (priority) {
      case SessionPriority.LOW:
        return 'Baixa'
      case SessionPriority.MEDIUM:
        return 'Média'
      case SessionPriority.HIGH:
        return 'Alta'
      default:
        return 'Média'
    }
  },

  /**
   * Get CSS color classes for priority
   */
  getColor: (priority: SessionPriority): string => {
    switch (priority) {
      case SessionPriority.HIGH:
        return 'text-red-600'
      case SessionPriority.MEDIUM:
        return 'text-yellow-600'
      case SessionPriority.LOW:
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  },

  /**
   * Get all priority options for filters
   */
  getAllOptions: (): Array<{ value: SessionPriority | 'all', label: string }> => [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: SessionPriority.HIGH, label: `${SessionPriorityUtils.getLabel(SessionPriority.HIGH)} Prioridade` },
    { value: SessionPriority.MEDIUM, label: `${SessionPriorityUtils.getLabel(SessionPriority.MEDIUM)} Prioridade` },
    { value: SessionPriority.LOW, label: `${SessionPriorityUtils.getLabel(SessionPriority.LOW)} Prioridade` }
  ]
}

/**
 * Date utilities for tutoring sessions
 */
export const TutoringDateUtils = {
  /**
   * Format date for display
   */
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  },

  /**
   * Format time for display
   */
  formatTime: (date: Date): string => {
    return date.toTimeString().slice(0, 5)
  },

  /**
   * Get all date filter options
   */
  getDateFilterOptions: () => [
    { value: 'all', label: 'Todas as Datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'upcoming', label: 'Próximas' },
    { value: 'past', label: 'Passadas' }
  ]
}

/**
 * URL utilities for meeting links
 */
export const MeetingUrlUtils = {
  /**
   * Validates if a URL is valid
   */
  validateUrl: (url: string): boolean => {
    if (!url || url.trim() === '') return true // Optional field
    
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  },

  /**
   * Gets the meeting platform from URL
   */
  getMeetingPlatform: (url: string): string => {
    if (!url) return 'Link'
    
    const lowerUrl = url.toLowerCase()
    
    if (lowerUrl.includes('zoom.us')) return 'Zoom'
    if (lowerUrl.includes('meet.google.com')) return 'Google Meet'
    if (lowerUrl.includes('teams.microsoft.com')) return 'Teams'
    if (lowerUrl.includes('whereby.com')) return 'Whereby'
    if (lowerUrl.includes('jitsi')) return 'Jitsi'
    
    return 'Reunião'
  },

  /**
   * Formats URL for display (truncates if too long)
   */
  formatUrlForDisplay: (url: string, maxLength: number = 50): string => {
    if (!url) return ''
    
    if (url.length <= maxLength) return url
    
    return url.substring(0, maxLength - 3) + '...'
  }
}
