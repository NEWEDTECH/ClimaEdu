'use client'

import { TutorSession } from '@/app/tutor/tutoring/data/mockTutorData'
import { Card, CardContent,  } from '@/components/ui/card/card'
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, UserIcon } from 'lucide-react'

interface TutoringStatsProps {
  sessions: TutorSession[]
}

export function TutoringStats({ sessions }: TutoringStatsProps) {
  // Calculate stats
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress').length
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled' || s.status === 'no_show').length
  const highPrioritySessions = sessions.filter(s => s.priority === 'high' && s.status === 'scheduled').length

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s.date === today && s.status === 'scheduled').length

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
    },
    {
      title: 'Alta Prioridade',
      value: highPrioritySessions,
      icon: <AlertCircleIcon size={20} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
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
