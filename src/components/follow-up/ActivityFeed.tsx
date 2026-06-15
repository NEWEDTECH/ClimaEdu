'use client'

import React from 'react'
import type { ActivityItem, ActivityType } from '@/hooks/follow-up/useStudentActivities'

interface ActivityIconProps {
  type: ActivityType
}

function ActivityIcon({ type }: ActivityIconProps) {
  const colorClass =
    type === 'lesson_completion'
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
      : type === 'questionnaire_submission'
      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
      : type === 'certificate_earned'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
      : type === 'discussion_post'
      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-500'

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {type === 'lesson_completion' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'questionnaire_submission' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )}
      {type === 'certificate_earned' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )}
      {type === 'discussion_post' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )}
      {type === 'activity_submission' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )}
    </div>
  )
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  loading: boolean
  error: string | null
  showCourse?: boolean
  emptyMessage?: string
}

export function ActivityFeed({
  activities,
  loading,
  error,
  showCourse = true,
  emptyMessage = 'Nenhuma atividade recente registrada.',
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-3" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-red-500 dark:text-red-400 py-4 text-sm">{error}</p>
    )
  }

  if (activities.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-4">{emptyMessage}</p>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start">
          <div className="mr-3">
            <ActivityIcon type={activity.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.title}</p>
            <div className="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400 gap-1">
              {showCourse && <span>{activity.courseTitle}</span>}
              <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            {activity.type === 'questionnaire_submission' && activity.score !== undefined && (
              <p className="text-xs mt-1">
                Nota: <span className="font-medium">{activity.score}%</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
