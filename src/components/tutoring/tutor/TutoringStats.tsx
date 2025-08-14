'use client'

import { TutoringSession, TutoringSessionStatus } from '@/_core/modules/tutoring'
import { Card, CardContent } from '@/components/ui/card/card'
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, UserIcon } from 'lucide-react'

interface TutoringStatsProps {
  sessions: TutoringSession[]
}

export function TutoringStats({ sessions }: TutoringStatsProps) {
  // Calculate stats using enums
  const requestedSessions = sessions.filter(s => s.status === TutoringSessionStatus.REQUESTED).length
  const scheduledSessions = sessions.filter(s => s.status === TutoringSessionStatus.SCHEDULED).length
  const completedSessions = sessions.filter(s => s.status === TutoringSessionStatus.COMPLETED).length
  const inProgressSessions = sessions.filter(s => s.status === TutoringSessionStatus.IN_PROGRESS).length
  const cancelledSessions = sessions.filter(s => 
    s.status === TutoringSessionStatus.CANCELLED || 
    s.status === TutoringSessionStatus.NO_SHOW
  ).length

  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledDate)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime() && 
           (s.status === TutoringSessionStatus.REQUESTED || s.status === TutoringSessionStatus.SCHEDULED)
  }).length

  const stats = [
    {
      title: 'Sessões Hoje',
      value: todaySessions,
      icon: <CalendarIcon size={20} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Solicitadas',
      value: requestedSessions,
      icon: <AlertCircleIcon size={20} />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Agendadas',
      value: scheduledSessions,
      icon: <ClockIcon size={20} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Em Andamento',
      value: inProgressSessions,
      icon: <UserIcon size={20} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Concluídas',
      value: completedSessions,
      icon: <CheckCircleIcon size={20} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Canceladas',
      value: cancelledSessions,
      icon: <XCircleIcon size={20} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`border ${stat.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
